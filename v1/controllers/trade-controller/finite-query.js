const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');
const {json} = require("express");

/**
 * @api {post} /api/trade/query 交易查詢（Credit API）
 * @apiName query
 * @apiGroup trade
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID               商店ID
 * @apiParam {String}   merKey              商店KEY
 * @apiParam {String}   merIv               商店IV
 * @apiParam {Array}    merTradeNoArray     商店訂單編號
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
 * @apiSuccess {String} CardBank 發卡銀行代碼 *若為國內發卡行則為銀行代碼(3碼)，若非國內發卡行則為”-“
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
    const { merID, merKey, merIv, merTradeNoArray } = req.body;
    const queryNo = merTradeNoArray.join(',');

    const merData = {
        MerID: merID,
        QueryNo: queryNo,
        QueryType: 1,
        Timestamp: Math.floor(Date.now() / 1000),
    }

    const plaintext = qs.stringify(merData);
    const encryptInfo = encrypt(plaintext, merKey, merIv)
    const hashInfo = sha256(encryptInfo, merKey, merIv)

    const requestData = qs.stringify({
        MerID: merID,
        Version: '1.0',
        EncryptInfo: encryptInfo,
        HashInfo: hashInfo
    });

    try {
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/trade/finite_query', requestData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // console.log('✅ Credit Transaction Response:', responseData.data);

        const encryptHex = responseData.data.EncryptInfo; // ← 換成實際 EncryptInfo 回傳值

        // 解密
        const decrypted = decrypt(encryptHex, merKey, merIv);
        console.log('✅ 解密後內容:', decrypted);
        const result = JSON.parse(decrypted);
        res.status(200).json(result);
    } catch (err) {
        console.error('❌ Request Error:', err.response?.data || err.message);
        res.status(500).send(err.message)
    }
}
