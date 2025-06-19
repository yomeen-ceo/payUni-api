const { encrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const { apiProcess } = require('../../../utils/payuni-apiworker.js');


/**
 * @api {post /credit
 * @apiName credit
 * @apiGroup payment
 * @apiParam {String}   merID               商店ID
 * @apiParam {String}   merKey              商店KEY
 * @apiParam {String}   merIv               商店IV
 * @apiParam {String}   prodDesc            商品名稱
 * @apiParam {String}   tradeAmt            訂單金額
 * @apiParam {Number}   cardNo              信用卡號
 * @apiParam {Number}   cardExpired         信用卡期限
 * @apiParam {Number}   cardCVC             信用卡CVC
 * @apiParam {String}   creditToken         信用卡Token (付款人綁定資料使用，例：會員編號或Email手機等)
 * @apiParam {Number}   creditTokenType     信用卡 Token 紀錄類型 會員: 會員旗下所有商店代號共用此Token 商店: 僅限於首次交易商店代號可使用此Token
 * @apiParam {Number}   creditTokenExpired  信用卡 Token 有效期間(信用卡 Token 有效期間，若未帶此參數，則預設以該信用卡到期日為主)
 * @apiParam {Number}   creditHash          信用卡 Hash (交易回傳的 CreditHash 值 當有值時，CardNo, CardExpired,CardCVC 為非必填)
 * @apiParam {String}   usrMail             消費者信箱 (格式: 信箱格式若有開啟物流功能時此欄必填，將視為物流收件人信箱若有開啟電子發票功能且CarrierType=amego時，此欄位必填
 * @apiParam {String}   carrierType         發票載具類別 | 如需開立發票此參數必帶，無須開立則不用帶此參數
 * @apiParam {String}   carrierInfo         載具內容 | 當 CarrierType 為3J0002、CQ0001、Donate、Company 時,此欄必需填入對應資訊。
 * @apiParam {String}   invBuyerName        買方名稱或公司抬頭
 *
 * 成功帶入信用卡token 「creditToken」取得之response範例，需要將creditHash存入資料庫
 * {
 *     "Status": "SUCCESS",
 *     "Message": "授權成功",
 *     "MerID": "YOME1749113748",
 *     "MerTradeNo": "ORDER1749455901844",
 *     "Gateway": "1",
 *     "TradeNo": "1749455902654711792",
 *     "TradeAmt": "2",
 *     "TradeStatus": "1",
 *     "PaymentType": "1",
 *     "CardBank": "812",
 *     "Card6No": "414763",
 *     "Card4No": "0001",
 *     "CardInst": "1",
 *     "FirstAmt": "2",
 *     "EachAmt": "0",
 *     "ResCode": "00",
 *     "ResCodeMsg": "授權成功(模擬)",
 *     "AuthCode": "000000",
 *     "AuthBank": "812",
 *     "AuthBankName": "台新國際商業銀行",
 *     "AuthType": "1",
 *     "AuthDay": "20250609",
 *     "AuthTime": "155822",
 *     "CreditHash": "0B3A67C491847429A2FBD2D8A55BF0F7AD47ED3F888B9C497A07197CDFE11EA9",  <--- 後續可單獨帶這個欄位做交易驗證
 *     "CreditLife": "0630"
 * }
 *
 */
module.exports = async (req, res) => {
    const {
        merID,
        merKey,
        merIv,
        prodDesc,
        tradeAmt,
        cardNo,
        cardExpired,
        cardCVC,
        creditToken,
        creditTokenType,
        creditTokenExpired,
        creditHash,
        userMail,
        carrierType,
        carrierInfo,
        invBuyerName,
        userIP,
        buyerHash,
        isSandbox
    } = req.body;
    const merData = {}
    merData.MerTradeNo = `ORDER${Date.now()}`;
    merData.MerID= merID
    merData.MerKey= merKey
    merData.merIv= merIv
    merData.Timestamp = Math.floor(Date.now() / 1000)
    merData.ProdDesc = prodDesc
    merData.TradeAmt = tradeAmt
    merData.UserMail = userMail || ''
    merData.CarrierType = carrierType || ''
    merData.CarrierInfo = carrierInfo || ''
    merData.InvBuyerName = invBuyerName || ''
    merData.NotifyURL = 'https://yomeen-payuni-api-357485790994.asia-east1.run.app/v1/payment/notify'
    merData.ReturnURL = 'https://yomeen-payuni-api-357485790994.asia-east1.run.app/v1/payment/return'
    // API3D: 1
    if (cardNo || cardExpired || cardCVC) {
        console.log('使用信用卡號')
        merData.CardNo = cardNo || '4147631000000001'
        merData.CardExpired = cardExpired || '0630'
        merData.CardCVC = cardCVC || '123'
        merData.CreditToken = creditToken || ''
    }
    if (creditHash) {
        console.log('使用信用卡Hash')
        merData.CreditTokenType = creditTokenType
        merData.CreditToken = creditToken
        merData.CreditTokenExpired = creditTokenExpired
        merData.CreditHash = creditHash
    }
    if (userIP) {
        console.log('可紀錄使用者IP')
        merData.userIP = userIP
    }
    if (buyerHash) {
        merData.buyerHash = buyerHash
    }
    const plaintext = qs.stringify(merData);
    const encryptInfo = encrypt(plaintext, merKey, merIv)
    const hashInfo = sha256(encryptInfo, merKey, merIv)
    const payLoad = qs.stringify({
        MerID: merID,
        Version: '1.2',
        EncryptInfo: encryptInfo,
        HashInfo: hashInfo
    });
    await apiProcess(res, 'credit', payLoad, merKey, merIv, isSandbox);
}
