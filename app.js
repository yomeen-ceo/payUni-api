const express = require('express')
const bodyParser = require('express');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const v1Routes = require('./v1/routes');
app.use('/v1', v1Routes); // 自動對應 /v1/upp、/v1/payment


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

// cloud run 要用8080port
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`hello world: listening on port ${port}`);
});

