const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  createActivityLog,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { validateActivity } = require('../middleware/validation');

// All activity routes require authentication
router.use(protect);

router.route('/')
  .get(getActivityLogs)
  .post(validateActivity, createActivityLog);

module.exports = router;
