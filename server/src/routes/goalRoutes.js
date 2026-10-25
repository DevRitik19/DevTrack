const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const { validateCreateGoal, validateUpdateGoal } = require('../middleware/validation');

// All goal routes require authentication
router.use(protect);

router.route('/')
  .get(getGoals)
  .post(validateCreateGoal, createGoal);

router.route('/:id')
  .patch(validateUpdateGoal, updateGoal)
  .delete(deleteGoal);

module.exports = router;
