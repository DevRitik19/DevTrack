const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
