const express = require('express');
const router = express.Router();

router.use('/upp', require('./upp'));
router.use('/payment', require('./payment'));
router.use('/trade', require('./trade'));

module.exports = router;
