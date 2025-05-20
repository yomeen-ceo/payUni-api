const { encrypt, decrypt, sha256 } = require("./utils/payuni-crypto.js");
const express = require('express')
const bodyParser = require('express');
const crypto = require('crypto');
const qs = require('querystring');

const v1RouteUpp =  require("./v1/routes/upp.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/v1/upp', v1RouteUpp);


// 首頁，測試服務是否成功佈署
app.get('/', (req, res) => {
    const name = process.env.NAME || 'yomeen payuni api';
    res.send(`Hello ${name}!`);
});

/**
 * @api {get} /order 測試下單，實際產生form給使用者填寫後submit，post給/upp
 * @apiName order
 * @apiSuccess {String} ProdDesc 商品名稱
 * @apiSuccess {String} TradeAmt 訂單金額
 *
 */
app.get('/order', (req, res) => {
    res.send(`
    <html lang="zh_tw">
      <body>
        <h2>測試付款頁</h2>
        <form method="POST" action="/v1/upp/create-order">
          <label>商品名稱：</label><br />
          <input type="text" name="ProdDesc" value="測試商品" /><br />
          <label>金額（元）：</label><br />
          <input type="number" name="TradeAmt" value="100" /><br /><br />
          <button type="submit">送出付款</button>
        </form>
      </body>
    </html>
  `);
});

/**
 * @api {post /result 接收payuni回傳前端資料，notify還沒寫
 * @apiName result
 * @apiParam {MerID}    EncryptInfo     商店代號
 * @apiParam {String}   Version         版本
 * @apiParam {String}   EncryptInfo     商品名稱
 * @apiParam {String}   HashInfo        商品金額
 *
 */
app.post('/result', (req, res) => {
    const raw = req.body;
    console.log(JSON.stringify(raw));
    // PayUni 會帶回這些欄位（含 EncryptInfo）
    const { EncryptInfo } = raw;

    if (!EncryptInfo) {
        return res.send('<h3>錯誤：未收到交易資料</h3>');
    }

    // 解密
    try {
        const decrypted = decrypt(EncryptInfo, merKey, merIv);
        const result = qs.parse(decrypted);
        console.log(result)
        // ✅ 顯示交易結果
        res.send(`
      <h2>交易結果</h2>
      <p>狀態：${result.Status}</p>
      <p>訂單編號：${result.MerTradeNo}</p>
      <p>交易金額：${result.TradeAmt}</p>

    `);
    } catch (err) {
        console.error('解密錯誤', err.message);
        res.send('<h3>交易資料解析失敗</h3>');
    }
});

// cloud run 要用8080port
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`hello world: listening on port ${port}`);
});

