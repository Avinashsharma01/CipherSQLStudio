const express = require('express');
const router = express.Router();
const { executeQuery } = require('../controllers/queryController');
const sanitizeQuery = require('../middleware/sanitize');

router.post('/execute', sanitizeQuery, executeQuery);

module.exports = router;
