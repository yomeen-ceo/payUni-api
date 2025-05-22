const express = require('express')
const router = express.Router()

const uppController = require("../controllers/upp-controller");
router.post('/create-order', uppController.createOrder)
router.post('/payment-return', uppController.paymentReturn)
module.exports = router;
