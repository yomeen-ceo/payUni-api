const { encrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const { apiProcess } = require('../../../utils/payuni-apiworker.js');

/**
 * @api {post} /query 交易查詢（Credit API）
 * @apiName query
 * @apiGroup trade
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   merTradeNo      商店訂單編號
 *
 * @apiSuccess {String} MerTradeNo 商店訂單編號
 * @apiSuccess {String} TradeNo UNi金流交易序號
 * @apiSuccess {String} TradeAmt 訂單金額
 * @apiSuccess {String} TradeFee 手續費金額
 * @apiSuccess {String="0","1","2"} TradeStatus 交易狀態（0: 未付款、1: 已付款、2: 取消）
 * @apiSuccess {String="1","2","3"} PaymentType 付款方式（1: 信用卡、2: 超商、3: ATM）
 * @apiSuccess {String} PaymentDay 支付日期（YYYY-MM-DD HH:II:SS）
 * @apiSuccess {String} CreateDay 建立日期（YYYY-MM-DD HH:II:SS）
 * @apiSuccess {String} Gateway 閘道 (1=單串、2=整合式支付頁 (UPP)、3=一頁式支付頁 (UOP))
 * @apiSuccess {String} DataSource 資料來源A=完整資料、B=處理中未完整，建議當查詢結果狀態為B時，可於10分鐘後再次發動交易查詢
 * @apiSuccess {String} Card6No 信用卡前六碼
 * @apiSuccess {String} Card4No 信用卡後四碼
 * @apiSuccess {String} CardExp 卡片到期日（MMYY）
 * @apiSuccess {String} CardInst 分期數
 * @apiSuccess {String} AuthCode 授權
 * @apiSuccess {String} AuthType 授權類型 (1=一次、2=分期、3=紅利、4=Apple Pay、5=Google Pay、6=Samsung Pay、7=銀聯)
 * @apiSuccess {String} CardBank 發卡銀行代碼 *若為國內發卡行則為銀行代碼(3碼)，若非國內發卡行則為"-"
 * @apiSuccess {String} CloseStatus 請款狀態（1=請款申請中, 2=請款成功, 3=請款取消, 7=請款處理中, 9=未申請）
 * @apiSuccess {String} CloseAmt 請款金額
 * @apiSuccess {String} RemainAmt 剩餘可退款金額
 *
 * @apiSuccessExample {json} 成功回應範例：
 * {
 *   "MerTradeNo": "ORDER1747907897088",
 *   "TradeNo": "1747907897637487065",
 *   "TradeAmt": "30",
 *   "TradeFee": "1",
 *   "TradeStatus": "1",
 *   "PaymentType": "1",
 *   "PaymentDay": "2025-05-22 17:58:17",
 *   "CreateDay": "2025-05-22 17:58:17",
 *   "Gateway": "1",
 *   "DataSource": "A",
 *   "Card6No": "414763",
 *   "Card4No": "0001",
 *   "CardExp": "0630",
 *   "CardInst": "1",
 *   "AuthCode": "000000",
 *   "AuthType": "1",
 *   "CardBank": "812",
 *   "CloseStatus": "2",
 *   "CloseAmt": "30",
 *   "RemainAmt": "30"
 * }
 */

module.exports = async (req, res) => {
  try {
    const { merID, merKey, merIv, merTradeNo, isSandbox } = req.body

    const merData = {
      MerID: merID,
      MerTradeNo: merTradeNo,
      Timestamp: Math.floor(Date.now() / 1000)
    }

    const plaintext = qs.stringify(merData)
    const encryptInfo = encrypt(plaintext, merKey, merIv)
    const hashInfo = sha256(encryptInfo, merKey, merIv)

    const payLoad = qs.stringify({
      MerID: merID,
      Version: '2.0',
      EncryptInfo: encryptInfo,
      HashInfo: hashInfo
    })

    // 攔截 apiProcess 回傳資料，避免它直接 res.json 出去
    let captured = null
    const mockRes = {
      status () { return this },
      set () { return this },
      json (data) { captured = data; return this },
      send (data) { captured = data; return this },
      end () { return this }
    }

    await apiProcess(mockRes, 'query', payLoad, merKey, merIv, isSandbox)

    const raw = captured

    if (!raw || typeof raw !== 'object') {
      return res.json({
        Status: 'FAILED',
        Message: '查詢回傳格式不正確',
        Raw: raw
      })
    }

    // 取出第一筆 Result
    const r = extractFirstResult(raw)
    if (!r) {
      return res.json({
        Status: raw.Status || 'FAILED',
        Message: raw.Message || '查無資料',
        MerID: merID,
        MerTradeNo: merTradeNo
      })
    }

    // 統一扁平化格式
    const paymentDT = r.PaymentDay || r.CreateDay || ''
    const out = {
      Status: raw.Status || 'SUCCESS',
      Message: raw.Message || '查詢成功',

      MerID: merID,
      MerTradeNo: r.MerTradeNo || merTradeNo,

      Gateway: r.Gateway || '',
      TradeNo: r.TradeNo || '',
      TradeAmt: r.TradeAmt || '',
      TradeStatus: r.TradeStatus || '',
      PaymentType: r.PaymentType || '',

      CardBank: r.CardBank || '',
      Card6No: r.Card6No || '',
      Card4No: r.Card4No || '',
      CardInst: r.CardInst || '',

      FirstAmt: r.FirstAmt || r.TradeAmt || '',
      EachAmt: r.EachAmt || '0',

      ResCode: r.ResCode || '0',
      ResCodeMsg: r.ResCodeMsg || (raw.Status === 'SUCCESS' ? '查詢成功' : (raw.Message || '')),

      AuthCode: r.AuthCode || '',
      AuthBank: r.AuthBank || r.CardBank || '',
      AuthBankName: r.AuthBankName || mapBankName(r.AuthBank || r.CardBank),
      AuthType: r.AuthType || '',

      AuthDay: r.AuthDay || ymd(paymentDT),
      AuthTime: r.AuthTime || hms(paymentDT)
    }

    return res.json(out)
  } catch (err) {
    console.error('[trade/query] error:', err)
    return res.status(500).json({
      Status: 'FAILED',
      Message: err.message || 'Internal Server Error'
    })
  }
}

function extractFirstResult (data) {
  if (!data || typeof data !== 'object') return null

  // A) 標準 Result array
  if (Array.isArray(data.Result) && data.Result.length > 0 && typeof data.Result[0] === 'object') {
    return data.Result[0]
  }

  // B) 扁平物件 Result[0][XXX]
  const r = {}
  for (const [k, v] of Object.entries(data)) {
    const m = k.match(/^Result\[0\]\[(.+)\]$/)
    if (m && m[1]) r[m[1]] = v
  }
  return Object.keys(r).length ? r : null
}

const BANK_CODE_MAP = {
  '004': '臺灣銀行',
  '005': '臺灣土地銀行',
  '006': '合作金庫商業銀行',
  '007': '第一商業銀行',
  '008': '華南商業銀行',
  '009': '彰化商業銀行',
  '011': '上海商業儲蓄銀行',
  '012': '台北富邦商業銀行',
  '013': '國泰世華商業銀行',
  '017': '兆豐國際商業銀行',
  '021': '花旗(台灣)商業銀行',
  '048': '王道商業銀行',
  '050': '臺灣中小企業銀行',
  '052': '渣打國際商業銀行',
  '053': '台中商業銀行',
  '081': '滙豐(台灣)商業銀行',
  '101': '瑞興商業銀行',
  '102': '華泰商業銀行',
  '103': '臺灣新光商業銀行',
  '108': '陽信商業銀行',
  '118': '板信商業銀行',
  '147': '三信商業銀行',
  '700': '中華郵政',
  '803': '聯邦商業銀行',
  '805': '遠東國際商業銀行',
  '806': '元大商業銀行',
  '807': '永豐商業銀行',
  '808': '玉山商業銀行',
  '809': '凱基商業銀行',
  '810': '星展(台灣)商業銀行',
  '812': '台新國際商業銀行',
  '815': '日盛國際商業銀行',
  '816': '安泰商業銀行',
  '822': '中國信託商業銀行',
  '824': '連線商業銀行',
}

function mapBankName (code) {
  if (!code || code === '-') return ''
  return BANK_CODE_MAP[code] || ''
}

function ymd (dtStr) {
  if (!dtStr || typeof dtStr !== 'string') return ''
  const d = dtStr.slice(0, 10)
  return d.replace(/-/g, '')
}

function hms (dtStr) {
  if (!dtStr || typeof dtStr !== 'string') return ''
  const t = dtStr.slice(11, 19)
  return t.replace(/:/g, '')
}
