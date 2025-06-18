const { encrypt, decrypt, sha256 } = require('../../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post} /cancel/cvs 交易取消超商代碼(CVS)
 * @apiGroup trade
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   payNo           超商代碼
 *
 * 取消成功範例
 * {
 *     "Status": "SUCCESS",
 *     "Message": "取消超商代碼成功",
 *     "MerID": "S06541049",
 *     "TradeAmt": "99",
 *     "PayNo": "T0003871",
 *     "VerifyCode": "3958",
 *     "PaymentType": "3"
 * }
 *
 * 重覆取消同一筆訂單範例
 * {
 *     "Status": "CVS02021",
 *     "Message": "該筆訂單已經無法取消代碼了",
 *     "MerID": "S06541049",
 *     "TradeAmt": "99",
 *     "PayNo": "",
 *     "VerifyCode": "",
 *     "PaymentType": "3"
 * }
 *
 * 超商代碼格式錯誤範例
 * {
 *     "Status": "CVS02019",
 *     "Message": "超商代碼長度規格有誤",
 *     "MerID": "S06541049",
 *     "TradeAmt": "0",
 *     "PayNo": "",
 *     "VerifyCode": "",
 *     "PaymentType": "3"
 * }
 *
 * 超商代碼對應不到訂單範例
 * {
 *     "Status": "CVS02020",
 *     "Message": "查無該筆訂單資料",
 *     "MerID": "S06541049",
 *     "TradeAmt": "0",
 *     "PayNo": "",
 *     "VerifyCode": "",
 *     "PaymentType": "3"
 * }
 * 沒帶入超商代碼範例
 * {
 *     "Status": "CVS02018",
 *     "Message": "未有超商代碼",
 *     "MerID": "S06541049",
 *     "TradeAmt": "0",
 *     "PayNo": "",
 *     "VerifyCode": "",
 *     "PaymentType": "3"
 * }
 *
 *
 */

module.exports = async (req, res) => {
    const { merID, merKey, merIv, payNo } = req.body;
    const merData = {
        MerID: merID,
        PayNo: payNo,
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/cancel_cvs', requestData, {
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
        console.error('❌ Request Error:', err.response?.data || err.message);
        res.status(500).send(err.message)
    }
}
