const crypto = require('crypto');

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

const merData = {
    MerID: 'AAA',
    MerTradeNO: 'BBB',
    Prod: '商品說明'
}

module.exports = {
    encrypt,
    decrypt,
    sha256
}
