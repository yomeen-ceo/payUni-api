const { decrypt } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
module.exports = async (req, res) => {
    const raw = req.body;
    console.log('raw:')
    console.log(raw)
    console.log(JSON.stringify(raw));
    // PayUni 會帶回這些欄位（含 EncryptInfo）
    const { EncryptInfo } = raw;

    if (!EncryptInfo) {
        return res.send('<h3>錯誤：未收到交易資料</h3>');
    }

    require('dotenv').config();
    // 商店參數
    const merKey = process.env.MER_KEY;
    const merIv = process.env.MER_IV

    // 解密
    try {
        const decrypted = decrypt(EncryptInfo, merKey, merIv);
        const result = qs.parse(decrypted);
        console.log(result)
        // ✅ 顯示交易結果
        res.send(`
      <h2>這裡是幕後交易完後自動回傳的網頁 /v1/payment/return</h2>
      <h2>交易結果</h2>
      <p>狀態：${result.Status}</p>
      <p>訂單編號：${result.MerTradeNo}</p>
      <p>交易金額：${result.TradeAmt}</p>

    `);
    } catch (err) {
        console.error('解密錯誤', err.message);
        res.send('<h3>交易資料解析失敗</h3>');
    }
}
