const Goal = require('../models/Goal');

// @desc    Get all goals for current user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const query = { user: req.user._id };

    if (status && ['Active', 'Completed', 'Archived'].includes(status)) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const goals = await Goal.find(query).sort({ status: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      targetType,
      targetValue,
      currentValue,
      unit,
      targetDate,
    } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description: description || '',
      category: category || 'General',
      targetType: targetType || 'Weekly',
      targetValue: Number(targetValue),
      currentValue: currentValue !== undefined ? Number(currentValue) : 0,
      unit: unit || 'hours',
      targetDate: targetDate || null,
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a goal
// @route   PATCH /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you are not authorized to modify it',
      });
    }

    const {
      title,
      description,
      category,
      targetType,
      targetValue,
      currentValue,
      unit,
      targetDate,
      status,
    } = req.body;

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (targetType !== undefined) goal.targetType = targetType;
    if (targetValue !== undefined) goal.targetValue = Number(targetValue);
    if (currentValue !== undefined) goal.currentValue = Number(currentValue);
    if (unit !== undefined) goal.unit = unit;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (status !== undefined) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or you are not authorized to delete it',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
