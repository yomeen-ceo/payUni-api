const crypto = require('crypto');
const qs = require("querystring");

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
 * @param {string} encryptStr - 要解密的參數
 * @param {string} key - 加密 Key
 * @param {Buffer} iv - 初始化向量 iv
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
 * @param {string} encryptStr - 加密過後的參數
 * @param {string} key - 加密 Key
 * @param {Buffer} iv - 初始化向量 iv
 * @returns {string} - hash 結果的字串，16進制且皆為大寫
 */

function sha256 (encryptStr, key, iv) {
    const hash = crypto.createHash('sha256').update(`${key}${encryptStr}${iv}`);
    return hash.digest('hex').toUpperCase();
}

function resProcess(resData, merKey, merIv) {
    console.log('✅ PayUni Response:', resData);
    // 1、API呼叫完成，成功取得回覆 → 得到加密內容待解密
    if (resData.EncryptInfo) {
        const encryptHex = resData.EncryptInfo;
        const decrypted = decrypt(encryptHex, merKey, merIv);
        console.log('解密內容：', decrypted)
        try {
            // 1-1 判斷是JSON
            const result = JSON.parse(decrypted);
            return result;
        } catch (e) {
            // 1-2 判排不是JSON
            console.log('這不是 JSON，可能是 querystring 或其他格式');
            const parsed = qs.parse(decrypted);
            // 1-2-1 有交易內容
            if (Object.getPrototypeOf(parsed) !== null) {
                const result = {};

                for (const [key, value] of Object.entries(parsed)) {
                    const match = key.match(/^Result\[0]\[(.+)]$/);
                    if (match) {
                        result[match[1]] = value;
                    }
                }
                return result;
            } else {
                // 1-2-2 沒有交易內容
                return qs.parse(decrypted);
            }
        }
    // 2、API呼叫完成，但要求不符合 → 只有商店ID和狀態（錯誤代碼）
    } else {
        console.log('API呼叫完成，但要求不符合，錯誤代碼為:', resData.Status);
        return resData;
    }
}

const merData = {
    MerID: 'AAA',
    MerTradeNO: 'BBB',
    Prod: '商品說明'
}

module.exports = {
    encrypt,
    decrypt,
    sha256,
    resProcess
}
