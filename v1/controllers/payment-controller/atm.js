const { encrypt, decrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const axios = require('axios');

/**
 * @api {post /atm
 * @apiName atm
 * @apiGroup payment
 * @apiParam {String}   merID           商店ID
 * @apiParam {String}   merKey          商店KEY
 * @apiParam {String}   merIv           商店IV
 * @apiParam {String}   prodDesc        商品名稱
 * @apiParam {String}   tradeAmt        訂單金額
 * @apiParam {Number}   BankType        銀行(代碼)
 * @apiParam {Number}   UserMail        消費者信箱
 * @apiParam {Number}   ExpireDate      繳費截止日期
 * @apiParam {Number}   BuyerHash       買方會員Token Hash
 * @apiParam {Number}   CarrierType     發票載具類別
 * @apiParam {Number}   CarrierInfo     載具內容
 * @apiParam {Number}   InvBuyerName    買方名稱或公司抬頭
 *
 */
module.exports = async (req, res) => {
    const { merID, merKey, merIv, prodDesc, tradeAmt, bankType, userMail, carrierType, carrierInfo, invBuyerName } = req.body;

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
    merData.BankType = bankType


    console.log('merData:', merData)

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
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'payuni' }
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
        res.status(500).send(err.message)
    }
}
