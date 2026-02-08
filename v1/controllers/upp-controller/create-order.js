const { encrypt, sha256 } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");

/**
 * @api {post /upp 接收訂單，產生加密內容產生前端formData，送回前端自動發給upp，前端會自動跳轉到payuni的支付頁面
 * @apiName upp
 * @apiParam {String}   ProdDesc    商品名稱
 * @apiParam {Number}   TradeAmt    商品金額
 * @apiParam {String}   MerTradeNo  客戶訂單編號
 * @apiParam {String}   ReturnURL   交易完成回傳網址
 * @apiParam {Boolean}  isSandbox   是否使用測試區 (預設 false)
 * @apiParam {String}   [MerTradeNo] 自訂訂單編號（選填，未填則自動產生 ORDER + 時間戳）
 *
 */
module.exports = async (req, res) => {
    // 本地存key
    require('dotenv').config();
    // 商店參數
    const merID = process.env.MER_ID;
    const merKey = process.env.MER_KEY;
    const merIv = process.env.MER_IV

    // 從 req.body 取得參數，MerTradeNo 為選填的自訂訂單編號
    const { ProdDesc, TradeAmt, isSandbox, MerTradeNo: customTradeNo, ReturnURL: customReturnURL, clientReturnURL, UsrMail: customUsrMail } = req.body;
    const UsrMail = customUsrMail || 'admin@yomeen.com';
    const useSandbox = isSandbox === true || isSandbox === 'true';
    const Timestamp = Math.floor(Date.now() / 1000);
    // 若有傳入自訂訂單編號則使用，否則自動產生
    const MerTradeNo = customTradeNo || `ORDER${Date.now()}`;
    // 預設的 payment-return 路徑
    const defaultReturnURL = 'https://yomeen-payuni-api-dot-i-food-project-v1.an.r.appspot.com/v1/upp/payment-return';
    let ReturnURL = customReturnURL || defaultReturnURL;
    // 若有 clientReturnURL，附加到 ReturnURL query string，payment-return 解密後會 redirect 到該前端頁面
    if (clientReturnURL) {
        ReturnURL = `${ReturnURL}?clientReturnURL=${encodeURIComponent(clientReturnURL)}`;
    }

    // 根據 useSandbox 決定 API URL
    const apiUrl = useSandbox
        ? 'https://sandbox-api.payuni.com.tw/api/upp'
        : 'https://api.payuni.com.tw/api/upp';

    const payload = {
        MerID: merID,
        Timestamp,
        MerTradeNo,
        TradeAmt,
        ProdDesc,
        UsrMail,
        ReturnURL
    };

    const plaintext = qs.stringify(payload);
    const encryptInfo = encrypt(plaintext, merKey, merIv)
    const hashInfo = sha256(encryptInfo, merKey, merIv)


    const formHtml = `
    <html lang="zh_tw">
      <body onload="document.forms[0].submit()">
        <form method="POST" action="${apiUrl}">
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
