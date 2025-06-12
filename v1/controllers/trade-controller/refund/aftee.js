const { encrypt, decrypt, sha256 } = require('../../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post} /refund/aftee 交易請退款（Credit API）
 * @apiGroup trade
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   tradeNo         UNi序號
 * @apiParam {String}   tradeAmt        訂單金額
 *
 * 退款成功範例
 * {
 *     "Status": "SUCCESS",
 *     "Message": "訂單退款成功",
 *     "MerID": "YOME88886666",
 *     "TradeNo": "1749552629788334673",
 *     "RefundAmt": "21",
 *     "RefundNo": "test_1749713121",
 *     "RefundDT": "2025-06-12 15:25:21"
 * }
 * 退到超過範例
 * {
 *     "Status": "REFUND04005",
 *     "Message": "超過可退款金額(AFTEE)",
 *     "MerID": "YOME88886666",
 *     "TradeNo": "1749552629788334673",
 *     "RefundAmt": "210",
 *     "RefundNo": "",
 *     "RefundDT": ""
 * }
 *
 */

module.exports = async (req, res) => {
    const { merID, merKey, merIv, tradeNo, tradeAmt } = req.body;
    const merData = {
        MerID: merID,
        TradeNo: tradeNo,
        TradeAmt: tradeAmt,
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/trade/common/refund/aftee', requestData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'payuni' }
        });

        const encryptHex = responseData.data.EncryptInfo; // ← 換成實際 EncryptInfo 回傳值

        // 解密
        const decrypted = decrypt(encryptHex, merKey, merIv);
        console.log('✅ 解密後內容:', decrypted);
        // 先解析 URL query string
        const parsed = qs.parse(decrypted);
        // console.log('parsed', parsed);

        res.send(parsed);
    } catch (err) {
        const errMessage = err.response?.data || err.message;
        console.error('❌ Request Error:', err.response?.data || err.message);
        res.status(500).send(errMessage)
    }
}
