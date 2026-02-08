const express = require('express');
const bodyParser = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
cors({credentials: true, origin: true})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const v1Routes = require('./v1/routes');
app.use('/v1', v1Routes); // 自動對應 /v1/upp、/v1/payment


// 首頁，測試服務是否成功佈署
app.get('/', (req, res) => {
    const name = process.env.NAME || 'yomeen payuni api';
    res.send(`Hello ${name}!`);
});

// 檢查對外 IP (驗證 VPC connector 是否生效)
app.get('/check-ip', (req, res) => {
    const https = require('https');
    https.get('https://api.ipify.org?format=json', (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            try {
                const json = JSON.parse(data);
                res.json({
                    outboundIP: json.ip,
                    expectedIP: '35.200.106.212',
                    match: json.ip === '35.200.106.212'
                });
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });
    }).on('error', (e) => {
        res.status(500).json({ error: e.message });
    });
});

/**
 * @api {get} /order 測試下單，實際產生form給使用者填寫後submit，post給/upp
 * @apiName order
 * @apiSuccess {String} ProdDesc 商品名稱
 * @apiSuccess {String} TradeAmt 訂單金額
 *
 */
app.get('/order', (req, res) => {
    const viewPath = path.join(__dirname, 'v1/views/order.html');
    const html = fs.readFileSync(viewPath, 'utf-8');
    res.send(html);
});

/**
 * @api {get} /echoseed-order 模擬 EchoSeed 下單頁，交易完成後 redirect 到 echoseed 的 payResult 頁面
 */
app.get('/echoseed-order', (req, res) => {
    const viewPath = path.join(__dirname, 'v1/views/echoseed-order.html');
    const html = fs.readFileSync(viewPath, 'utf-8');
    res.send(html);
});

/**
 * @api {get} /cancel-credit 測試取消信用卡授權
 */
app.get('/cancel-credit', (req, res) => {
    res.send(`
    <html lang="zh_tw">
      <body>
        <h2>取消信用卡授權</h2>
        <form method="POST" action="/v1/trade/cancel/credit">
          <label>UNi序號 (TradeNo)：</label><br />
          <input type="text" name="tradeNo" placeholder="例如: 1748448612217903125" style="width: 300px;" /><br /><br />
          <label>環境：</label><br />
          <select name="isSandbox">
            <option value="false">正式區</option>
            <option value="true">測試區 (Sandbox)</option>
          </select><br /><br />
          <button type="submit">取消授權</button>
        </form>
        <p style="color: #666; font-size: 12px;">* 商店金鑰由伺服器端處理</p>
      </body>
    </html>
  `);
});

/**
 * @api {get} /refund-linepay LINE Pay 退款測試頁
 */
app.get('/refund-linepay', (req, res) => {
    res.send(`
    <html lang="zh_tw">
      <body>
        <h2>LINE Pay 退款</h2>
        <form method="POST" action="/v1/trade/refund/linepay">
          <label>UNi序號 (TradeNo)：</label><br />
          <input type="text" name="tradeNo" placeholder="例如: 1748448612217903125" style="width: 300px;" /><br /><br />
          <label>退款金額 (TradeAmt)：</label><br />
          <input type="number" name="tradeAmt" placeholder="例如: 100" style="width: 300px;" /><br /><br />
          <label>環境：</label><br />
          <select name="isSandbox">
            <option value="false">正式區</option>
            <option value="true">測試區 (Sandbox)</option>
          </select><br /><br />
          <button type="submit">執行退款</button>
        </form>
        <p style="color: #666; font-size: 12px;">* 商店金鑰由伺服器端處理</p>
      </body>
    </html>
  `);
});

// cloud run 要用8080port
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`yomeen PayUni: listening on port ${port}`);
});

