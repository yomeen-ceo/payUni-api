const DOMAIN = {
    sandbox: 'https://sandbox-api.payuni.com.tw',
    production: 'https://api.payuni.com.tw',
};

const API_PATHS = {
    credit: '/api/credit',
    finiteQuery: '/api/trade/finite_query',
    cvs: '/api/cvs',
    linepay: '/api/linepay',
    atm: '/api/atm',
    query: '/api/trade/query',
    finiteQuery: '/api/trade/finite_query',
};

/**
 * @param {string} apiType - 例如 'credit', 'tradeQuery'
 * @param {boolean} isSandbox - 是否使用 sandbox 網域
 * @returns {string|null} - 組合好的完整 URL
 */
function getPayuniUrl(apiType, isSandbox = false) {
    const domain = isSandbox ? DOMAIN.sandbox : DOMAIN.production;
    const path = API_PATHS[apiType];

    if (!path) return null;

    return `${domain}${path}`;
}

module.exports = getPayuniUrl;
