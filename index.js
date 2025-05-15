import express from 'express';
import bodyParser from 'express';
import crypto from 'crypto';
import * as qs from 'querystring';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// 商店參數
const merID = '';
const merKey = ''
const merIv = Buffer.from('');

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
        <form method="POST" action="/upp">
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
 * @api {post /upp 接收訂單，產生加密內容產生前端formData，送回前端自動發給upp，前端會自動跳轉到payuni的支付頁面
 * @apiName upp
 * @apiParam {String}   ProdDesc    商品名稱
 * @apiParam {Number}   TradeAmt    商品金額
 *
 */
app.post('/upp', async (req, res) => {
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
        ReturnURL: 'https://yomeen-payuni-api-357485790994.asia-east1.run.app/result'
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
})

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


// 以下為加解密函式

/**
 * @param {string} encryptStr - 要解密的參數
 * @param key merKey
 * @param iv merIv
 * @returns {string} - 解密結果
 */
function decrypt(encryptStr, key, iv) {
    const [encryptData, tag] = Buffer.from(encryptStr, 'hex').toString().split(':::');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    let decipherText = decipher.update(encryptData, 'base64', 'utf8');
    decipherText += decipher.final('utf8');

    return decipherText;
}

/**
 * @param {string} plaintext - 要加密的參數
 * @param {string} key - 加密 Key
 * @param {Buffer} iv - 初始化向量 iv
 * @returns {Buffer} - 加密結果
 */
function encrypt(plaintext, key, iv) {
    const cipher = crypto.createCipheriv('aes-256-gcm',key, iv);

    let cipherText = cipher.update(plaintext, 'utf8', 'base64');
    cipherText += cipher.final('base64');

    const tag = cipher.getAuthTag().toString('base64');
    return Buffer.from(`${cipherText}:::${tag}`).toString('hex').trim();

}


/**
 * @param {string} encryptStr - 加密過後的參數
 * @param {string} key - 加密 Key
 * @param {Buffer} iv - 初始化向量 iv
 * @returns {string} - hash 結果的字串，16進制且皆為大寫
 */

function sha256 (encryptStr, key, iv) {
    const hash = crypto.createHash('sha256').update(`${key}${encryptStr}${iv}`);
    return hash.digest('hex').toUpperCase();
}

