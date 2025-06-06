const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post} /query 信用卡Token查詢(約定)(CREDIT)
 * @apiName query
 * @apiGroup credit-bind
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID               商店ID
 * @apiParam {String}   merKey              商店KEY
 * @apiParam {String}   merIv               商店IV
 * @apiParam {String}   creditToken         （可選）信用卡 Token
 * @apiParam {String}   creditTokenType     （可選）信用卡 Token 紀錄類型
 * @apiParam {String}   creditHash          （可選）信用卡 Token Hash
 *
 * {
 *     "Status": "SUCCESS",
 *     "Message": "查詢成功",
 *     "Result[0][CreditHash]": "BFC5E076C43A0221BC50D4F2D1FE4F321DA45F6C584E046B828F15C4905FDB45",
 *     "Result[0][CreditToken]": "0917366884",
 *     "Result[0][CreditTokenType]": "1",
 *     "Result[0][CreditTokenExpired]": "0630",
 *     "Result[0][CreditTokenStatus]": "1",
 *     "Result[0][Card6No]": "414763",
 *     "Result[0][Card4No]": "0001",
 *     "Result[0][CardExpiredDT]": "0630"
 * }
 *
 * {
 *     "Status": "QUERY02001",
 *     "Message": "綁定Token|Hash，請擇一送入",
 *     "MerID": "YOME1749113748"
 * }
 */

module.exports = async (req, res) => {
    const { merID, merKey, merIv, creditToken, creditHash } = req.body;
    const merData = {}

    merData.MerID= merID
    merData.MerKey= merKey
    merData.merIv= merIv
    merData.Timestamp = Math.floor(Date.now() / 1000)

    if (creditToken && !creditHash) {
        console.log('使用creditToken')
        merData.CreditToken= creditToken
    }

    if (!creditToken && creditHash) {
        console.log('使用creditHash')
        merData.CreditToken= creditToken
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/credit_bind/query', requestData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'payuni' }
        });

        // console.log('✅ Credit Transaction Response:', responseData.data);

        const encryptHex = responseData.data.EncryptInfo; // ← 換成實際 EncryptInfo 回傳值

        // 解密
        const decrypted = decrypt(encryptHex, merKey, merIv);
        console.log('✅ 解密後內容:', decrypted);
        // 先解析 URL query string
        const parsed = qs.parse(decrypted);
        res.status(200).json(parsed);
    } catch (err) {
        console.error('❌ Request Error:', err.response?.data || err.message);
        res.status(500).send(err.message)
    }
}
