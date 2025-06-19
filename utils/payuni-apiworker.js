const getPayuniUrl = require('./get-payuni-urls');
const axios = require("axios");
const {resProcess } = require('./payuni-crypto.js');

async function apiProcess(res, apiPath, payLoad, merKey, merIv, isSandbox) {
    const apiUrl = getPayuniUrl(apiPath, isSandbox);
    console.log('apiUrl:', apiUrl)
    try {
        const response = await axios.post(apiUrl, payLoad, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        res.send(resProcess(response.data, merKey, merIv));
    } catch (err) {
        console.error('❌ Request Error:', err.response?.data || err.message);
        res.status(500).send(err.message)
    }
}

module.exports = {
    apiProcess
}
