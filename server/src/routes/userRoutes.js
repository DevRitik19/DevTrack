const express = require('express');
const router = express.Router();
const {
  getPublicProfile,
  updateProfile,
  updateLeetCodeStats,
  syncLeetCodeStats,
  updatePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateLeetCodeStats } = require('../middleware/validation');

// Public developer profile
router.get('/:username/public', getPublicProfile);

// Authenticated user settings routes
router.patch('/profile', protect, updateProfile);
router.patch('/leetcode', protect, validateLeetCodeStats, updateLeetCodeStats);
router.post('/leetcode/sync', protect, syncLeetCodeStats);
router.patch('/password', protect, updatePassword);

module.exports = router;

