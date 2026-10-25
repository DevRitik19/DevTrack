const { body, param, validationResult } = require('express-validator');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Register validation rules
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain alphanumeric characters, underscores, and hyphens'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  handleValidationErrors,
];

// Login validation rules
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Project creation validation
const validateCreateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['Planned', 'In Progress', 'Completed'])
    .withMessage('Status must be Planned, In Progress, or Completed'),
  body('completionPercentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Completion percentage must be an integer between 0 and 100'),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('liveDemoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Live demo URL must be a valid URL'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array of strings'),
  handleValidationErrors,
];

// Project update validation (all fields optional)
const validateUpdateProject = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['Planned', 'In Progress', 'Completed'])
    .withMessage('Status must be Planned, In Progress, or Completed'),
  body('completionPercentage')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Completion percentage must be an integer between 0 and 100'),
  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('liveDemoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Live demo URL must be a valid URL'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies must be an array of strings'),
  handleValidationErrors,
];

// Goal creation validation
const validateCreateGoal = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Goal title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('targetValue')
    .isInt({ min: 1 })
    .withMessage('Target value must be an integer greater than 0'),
  body('currentValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current value cannot be negative'),
  body('targetType')
    .optional()
    .isIn(['Daily', 'Weekly', 'Target Date', 'Milestone'])
    .withMessage('Target type must be Daily, Weekly, Target Date, or Milestone'),
  body('category')
    .optional()
    .isIn(['DSA & LeetCode', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'System Design', 'General'])
    .withMessage('Invalid goal category'),
  body('unit')
    .optional()
    .isIn(['hours', 'problems', 'commits', 'lessons', 'tasks', 'days'])
    .withMessage('Invalid unit of measurement'),
  handleValidationErrors,
];

// Goal update validation
const validateUpdateGoal = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Goal title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('targetValue')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target value must be an integer greater than 0'),
  body('currentValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current value cannot be negative'),
  body('targetType')
    .optional()
    .isIn(['Daily', 'Weekly', 'Target Date', 'Milestone'])
    .withMessage('Target type must be Daily, Weekly, Target Date, or Milestone'),
  body('category')
    .optional()
    .isIn(['DSA & LeetCode', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'System Design', 'General'])
    .withMessage('Invalid goal category'),
  body('unit')
    .optional()
    .isIn(['hours', 'problems', 'commits', 'lessons', 'tasks', 'days'])
    .withMessage('Invalid unit of measurement'),
  handleValidationErrors,
];

// Activity log validation rules
const validateActivity = [
  body('minutesSpent')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Minutes spent must be between 1 and 1440 (24 hours)'),
  body('type')
    .optional()
    .isIn(['Coding', 'LeetCode Practice', 'Learning', 'Project Work', 'Bug Fix', 'System Design', 'Other'])
    .withMessage('Invalid activity type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors,
];

// LeetCode stats update validation rules
const validateLeetCodeStats = [
  body('easy')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Easy count cannot be negative'),
  body('medium')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Medium count cannot be negative'),
  body('hard')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Hard count cannot be negative'),
  body('total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total solved cannot be negative')
    .custom((total, { req }) => {
      const easy = req.body.easy !== undefined ? Number(req.body.easy) : 0;
      const medium = req.body.medium !== undefined ? Number(req.body.medium) : 0;
      const hard = req.body.hard !== undefined ? Number(req.body.hard) : 0;
      const sum = easy + medium + hard;
      if (sum > 0 && total !== undefined && Number(total) < sum) {
        throw new Error(`Total solved (${total}) cannot be less than sum of categories (${sum})`);
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateProject,
  validateUpdateProject,
  validateCreateGoal,
  validateUpdateGoal,
  validateActivity,
  validateLeetCodeStats,
};
