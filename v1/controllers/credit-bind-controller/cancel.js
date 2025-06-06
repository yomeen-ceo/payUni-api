const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post} /cancel 信用卡Token取消(約定/記憶卡號)(CREDIT)
 * @apiName cancel
 * @apiGroup credit-bind
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID               商店ID
 * @apiParam {String}   merKey              商店KEY
 * @apiParam {String}   merIv               商店IV
 * @apiParam {String}   useTokenType        信用卡 Token 類型 1=綁定 2=記憶卡號
 * @apiParam {String}   bindVal             信用卡 Token 或 信用卡 Hash
 * @apiParam {String}   creditTokenType     （可選）信用卡 Token 紀錄類型
 *
 *  1. 當 UseTokenType 為綁定時，請帶 CreditHash 進行取消。
 *  2. 當 UseTokenType 為記憶卡號時，請帶 CreditToken 進行取消。　
 *
 * {
 *     "Status": "SUCCESS",
 *     "Message": "取消成功",
 *     "Hash": "BFC5E076C43A0221BC50D4F2D1FE4F321DA45F6C584E046B828F15C4905FDB45"
 * }
 *
 * {
 *     "Status": "CANCEL03001",
 *     "Message": "取消失敗，查無符合約定資料",
 *     "MerID": "YOME1749113748"
 * }
 */

module.exports = async (req, res) => {
    const { merID, merKey, merIv, useTokenType, bindVal, creditTokenType } = req.body;
    const merData = {}

    merData.MerID= merID
    merData.MerKey= merKey
    merData.merIv= merIv
    merData.Timestamp = Math.floor(Date.now() / 1000)
    merData.UseTokenType= useTokenType;
    merData.BindVal = bindVal;
    merData.CreditToken= creditTokenType;
    console.log('merData', merData);
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/credit_bind/cancel', requestData, {
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
