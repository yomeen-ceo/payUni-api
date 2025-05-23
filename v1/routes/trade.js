const express = require('express')
const router = express.Router()

const tradeController = require("../controllers/trade-controller");
router.post('/query', tradeController.query)
router.post('/finite-query', tradeController.finiteQuery)
module.exports = router;
