const express = require('express')
const router = express.Router()

const tradeController = require("../controllers/trade-controller");

//單筆交易查詢
router.post('/query', tradeController.query)
//多筆交易查詢
router.post('/finite-query', tradeController.finiteQuery)

//信用卡交易請退款
router.post('/close/credit', tradeController.closeCredit)
//信用卡交易取消授權
router.post('/cancel/credit', tradeController.cancelCredit)

//交易取消超商代碼(cvs)
router.post('/cancel/cvs', tradeController.cancelCvs)

//後支付交易確認(aftee)
router.post('/confirm/aftee', tradeController.confirmAftee)

//後支付退款(AFTEE)
router.post('/refund/aftee', tradeController.refundAftee)
//
// //愛金卡退款(ICASH)
// router.post('/refund/icash', tradeController.refundIcash)
//
// //LINE Pay退款
// router.post('/refund/linepay', tradeController.refundLinePay)
//

module.exports = router;
