const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');


/**
 * @api {post /upp 接收訂單，產生加密內容產生前端formData，送回前端自動發給upp，前端會自動跳轉到payuni的支付頁面
 * @apiName upp
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   prodDesc        商品名稱
 * @apiParam {String}   tradeAmt        訂單金額
 * @apiParam {Number}   cardNo          信用卡號
 * @apiParam {Number}   cardExpired     信用卡期限
 * @apiParam {Number}   cardCVC         信用卡CVC
 *
 */
module.exports = async (req, res) => {

    const { merID, merKey, merIv, prodDesc, tradeAmt, cardNo, cardExpired, cardCVC } = req.body;
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/credit', requestData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // console.log('✅ Credit Transaction Response:', responseData.data);

        const encryptHex = responseData.data.EncryptInfo; // ← 換成實際 EncryptInfo 回傳值

        // 解密
        const decrypted = decrypt(encryptHex, merKey, merIv);
        // console.log('✅ 解密後內容:', decrypted);
        // 先解析 URL query string
        const parsed = qs.parse(decrypted);
        // 對 Message 欄位做 URL decode（Node 預設未解碼）
        if (parsed.Message) {
            parsed.Message = decodeURIComponent(parsed.Message);
        }
        console.log(parsed)
        res.send(parsed);
    } catch (err) {
        console.error('❌ Request Error:', err.response?.data || err.message);
    }
}
