const credit = require("./credit.js");
const atm = require("./atm.js");
const cvs = require("./cvs.js");
const aftee = require("./aftee.js");
const linepay = require("./linepay.js");
const paymentReturn = require("./payment-return.js");
const paymentNotify = require("./payment-notify.js");
module.exports = {
    credit,
    atm,
    cvs,
    linepay,
    aftee,
    paymentNotify,
    paymentReturn
}
