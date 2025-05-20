const { encrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");

/**
 * @api {post /upp 接收訂單，產生加密內容產生前端formData，送回前端自動發給upp，前端會自動跳轉到payuni的支付頁面
 * @apiName upp
 * @apiParam {String}   ProdDesc    商品名稱
 * @apiParam {Number}   TradeAmt    商品金額
 *
 */
module.exports = async (req, res) => {
    // 本地存key
    require('dotenv').config();
    // 商店參數
    const merID = process.env.MER_ID;
    const merKey = process.env.MER_KEY;
    const merIv = process.env.MER_IV

    const { ProdDesc, TradeAmt } = req.body;
    const Timestamp = Math.floor(Date.now() / 1000);
    const MerTradeNo = `ORDER${Date.now()}`;

    const payload = {
        MerID: merID,
        Timestamp,
        MerTradeNo,
        TradeAmt,
        ProdDesc,
        UsrMail: 'admin@yomeen.com',
        ReturnURL: 'https://yomeen-payuni-api-357485790994.asia-east1.run.app/v1/upp/payment-return'
    };

    const plaintext = qs.stringify(payload);
    const encryptInfo = encrypt(plaintext, merKey, merIv)
    const hashInfo = sha256(encryptInfo, merKey, merIv)


    const formHtml = `
    <html lang="zh_tw">
      <body onload="document.forms[0].submit()">
        <form method="POST" action="https://sandbox-api.payuni.com.tw/api/upp">
          <input type="hidden" name="MerID" value="${merID}" />
          <input type="hidden" name="Version" value="1.0" />
          <input type="hidden" name="EncryptInfo" value="${encryptInfo}" />
          <input type="hidden" name="HashInfo" value="${hashInfo}" />
          <noscript><input type="submit" value="Click here to continue" /></noscript>
        </form>
      </body>
    </html>
  `;
    res.set('Content-Type', 'text/html').send(formHtml);
}
