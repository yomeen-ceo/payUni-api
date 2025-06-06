const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post} /close 交易請退款（Credit API）
 * @apiName close
 * @apiGroup trade
 *
 * @apiHeader {String} Content-Type application/x-www-form-urlencoded
 *
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   tradeNo         UNi序號
 * @apiParam {String}   CloseType       關帳類型 1=請款 2=退款 -1=取消請款 -2=取消退款
 * @apiParam {String}   TradeAmt        請退款金額 (請退款時為必填)
 *
 *
 *
 *     信用卡交易請退款，信用卡已完成授權的交易，可透過此功能向銀行發動請款或退款訊息(平台預設為自動請款)
 *     包含以下：
 *     信用卡一次付清 (可全額請退款，部分請退款)
 *     分期付款 (僅全額請退款)
 *     紅利折抵 (僅全額請退款)
 *     國外卡 (可全額請退款，部分請退款)
 *     已授權之信用卡交易，可自行發動請款或由平台預設自行請款。
 *     已請款之信用卡交易，若有取消訂單發生可發動退款。
 *     請款天期限制：授權成功後需於3天內請款。(若逾期請款且遭收單機構或發卡機構不受理時，本公司不負付款之責。)
 *     退款天期限制：請款完成後需於180天內退款。
 *
 *
 * {
 *     "Status": "SUCCESS",
 *     "Message": "處理成功",
 *     "MerID": "S06541049",
 *     "TradeNo": "1747907897637487065",
 *     "CloseType": "2"
 * }
 *
 * {
 *     "Status": "CLOSE03001",
 *     "Message": "處理失敗，退款失敗，退款金額($30)，請款金額($30)，目前已退款($30)",
 *     "MerID": "S06541049",
 *     "TradeNo": "1747907897637487065",
 *     "CloseType": "2"
 * }
 *
 * {
 *     "Status": "CLOSE02010",
 *     "Message": "未有請退款金額",
 *     "MerID": "S06541049"
 * }
 *
 */

module.exports = async (req, res) => {
    const { merID, merKey, merIv, tradeNo, closeType, tradeAmt } = req.body;
    const merData = {
        MerID: merID,
        TradeNo: tradeNo,
        Timestamp: Math.floor(Date.now() / 1000),
        CloseType: closeType,
        TradeAmt: tradeAmt,
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
        const responseData = await axios.post('https://sandbox-api.payuni.com.tw/api/trade/close', requestData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
