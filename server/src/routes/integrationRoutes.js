const express = require('express');
const router = express.Router();
const { getGitHubData, getLeetCodeData } = require('../controllers/integrationController');
const { apiLimiter } = require('../middleware/rateLimiter');

// Rate-limited integration endpoints
router.get('/github/:username', apiLimiter, getGitHubData);
router.get('/leetcode/:username', apiLimiter, getLeetCodeData);

module.exports = router;

