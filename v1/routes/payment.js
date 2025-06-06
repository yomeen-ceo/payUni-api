const express = require('express')
const router = express.Router()

const paymentController = require("../controllers/payment-controller");
router.post('/credit', paymentController.credit)
router.post('/atm', paymentController.atm)
router.post('/cvs', paymentController.cvs)
router.post('/linepay', paymentController.linepay)
router.post('/aftee', paymentController.aftee)
router.post('/return', paymentController.paymentReturn)
router.post('/notify', paymentController.paymentNotify)
module.exports = router;
