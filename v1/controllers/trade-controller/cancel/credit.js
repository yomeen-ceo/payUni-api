const { encrypt, decrypt, sha256 } = require('../../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post} /cancel/credit 交易請退款（Credit API）
 * @apiGroup trade
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   tradeNo         UNi序號
 *
 *     信用卡交易取消授權，信用卡已完成授權的交易，尚未執行請款可透過此功能向銀行發動取消授權訊息
 *     包含以下：
 *     信用卡一次付清
 *     分期付款
 *     紅利折抵
 *     國外卡
 *     已授權之信用卡交易，但尚未請款，若有取消訂單發生可自行發動取消授權。
 *
 *
 *
 * 取消成功範例
 * {
 *     "Status": "SUCCESS",
 *     "Message": "取消授權成功",
 *     "MerID": "S06541049",
 *     "TradeNo": "1748448612217903125"
 * }
 *
 * 帶入資料正確，但訂單已不能再取消
 * {
 *     "Status": "CANCEL03001",
 *     "Message": "取消授權失敗，訂單不為付款成功",
 *     "MerID": "S06541049",
 *     "TradeNo": "1748448612217903125"
 * }
 * {
 *     "Status": "CANCEL03001",
 *     "Message": "取消授權失敗，已存在請款成功紀錄 (2025-05-22 17:58:19)",
 *     "MerID": "S06541049",
 *     "TradeNo": "1747907897637487065"
 * }
 *
 */

module.exports = async (req, res) => {
    const { merID, merKey, merIv, tradeNo } = req.body;
    const merData = {
        MerID: merID,
        TradeNo: tradeNo,
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/trade/cancel', requestData, {
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
