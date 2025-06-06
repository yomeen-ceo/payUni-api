const express = require('express')
const router = express.Router()

const tradeController = require("../controllers/credit-bind-controller");
router.post('/query', tradeController.query)
router.post('/cancel', tradeController.cancel)
module.exports = router;
