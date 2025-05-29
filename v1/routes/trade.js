const express = require('express')
const router = express.Router()

const tradeController = require("../controllers/trade-controller");
router.post('/query', tradeController.query)
router.post('/finite-query', tradeController.finiteQuery)
router.post('/close', tradeController.close)
router.post('/cancel', tradeController.cancel)
module.exports = router;
