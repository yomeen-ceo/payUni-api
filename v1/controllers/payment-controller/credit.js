const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');


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
        invBuyerName
    } = req.body;

    const merTradeNo = `ORDER${Date.now()}`;
    const merData = {
        MerID: merID,
        Timestamp: Math.floor(Date.now() / 1000),
        MerTradeNo: merTradeNo,
        ProdDesc: prodDesc,
        TradeAmt: tradeAmt,
        CardNo: cardNo || '4147631000000001',
        CardExpired: cardExpired || '0630',
        CardCVC: cardCVC || '123',
        CreditTokenType: creditTokenType || '',
        CreditToken: creditToken || '',
        CreditTokenExpired: creditTokenExpired || '0630',
        CreditHash: creditHash || '',
        UserMail: userMail || '',
        CarrierType:  carrierType || '',
        CarrierInfo: carrierInfo || '',
        InvBuyerName: invBuyerName || '',
        NotifyURL: 'https://yomeen-payuni-api-357485790994.asia-east1.run.app/v1/payment/notify',
        ReturnURL: 'https://yomeen-payuni-api-357485790994.asia-east1.run.app/v1/payment/return',
        API3D: 1
    }

    const plaintext = qs.stringify(merData);
    const encryptInfo = encrypt(plaintext, merKey, merIv)
    const hashInfo = sha256(encryptInfo, merKey, merIv)

    const requestData = qs.stringify({
        MerID: merID,
        Version: '1.2',
        EncryptInfo: encryptInfo,
        HashInfo: hashInfo
    });

    try {
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/atm', requestData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // console.log('✅ Credit Transaction Response:', responseData.data);

        const encryptHex = responseData.data.EncryptInfo; // ← 換成實際 EncryptInfo 回傳值

        // 解密
        const decrypted = decrypt(encryptHex, merKey, merIv);
        // console.log('✅ 解密後內容:', decrypted);
        // 先解析 URL query string
        const parsed = qs.parse(decrypted);
        console.log(parsed)
        res.send(parsed);
    } catch (err) {
        console.error('❌ Request Error:', err.response?.data || err.message);
    }
}
