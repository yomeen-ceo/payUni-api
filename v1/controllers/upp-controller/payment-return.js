const { decrypt } = require('../../../utils/payuni-crypto.js');
const qs = require("querystring");
const fs = require('fs');
const path = require('path');

/**
 * @api {post /result 接收payuni回傳前端資料，notify還沒寫
 * @apiName result
 * @apiParam {MerID}    EncryptInfo     商店代號
 * @apiParam {String}   Version         版本
 * @apiParam {String}   EncryptInfo     商品名稱
 * @apiParam {String}   HashInfo        商品金額
 *
 */
module.exports = async (req, res) => {
    const raw = req.body;
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

        const resultJson = JSON.stringify(result);

        // 若 ReturnURL 帶有 clientReturnURL query param，解密後 redirect 到該前端頁面（如 echoseed）
        const clientReturnURL = req.query.clientReturnURL;
        if (clientReturnURL) {
            const redirectURL = `${clientReturnURL}?result=${encodeURIComponent(resultJson)}`;
            console.log('redirect to clientReturnURL:', redirectURL);
            return res.redirect(redirectURL);
        }

        // 無 clientReturnURL 時，使用本地 View 模板顯示結果
        const viewPath = path.join(__dirname, '../../views/payment-result.html');
        let template = fs.readFileSync(viewPath, 'utf-8');
        const html = template.replace('%%RESULT_DATA%%', resultJson);

        res.send(html);
    } catch (err) {
        console.error('解密錯誤', err.message);
        res.send('<h3>交易資料解析失敗</h3>');
    }
}
