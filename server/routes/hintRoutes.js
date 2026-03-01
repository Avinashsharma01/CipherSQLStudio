const express = require('express');
const router = express.Router();
const { getHint } = require('../controllers/hintController');

router.post('/', getHint);

module.exports = router;
