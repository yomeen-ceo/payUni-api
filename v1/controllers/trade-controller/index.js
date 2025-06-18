const query = require("./query.js");
const finiteQuery = require("./finite-query.js");
const closeCredit = require("./close/credit.js");
const cancelCredit = require("./cancel/credit.js");
const cancelCvs = require("./cancel/cvs.js");
const confirmAftee = require("./confirm/aftee.js");
const refundAftee = require("./refund/aftee.js");
const refundIcash = require("./refund/icash.js");
const refundLinepay = require("./refund/linepay.js");
const refundJkopay = require("./refund/jkopay.js");

module.exports = {
    query,
    finiteQuery,
    closeCredit,
    cancelCredit,
    cancelCvs,
    confirmAftee,
    refundAftee,
    refundIcash,
    refundLinepay,
    refundJkopay
}
