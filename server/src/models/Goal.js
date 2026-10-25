const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['DSA & LeetCode', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'System Design', 'General'],
      default: 'General',
    },
    targetType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Target Date', 'Milestone'],
      default: 'Weekly',
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target value must be at least 1'],
      default: 10,
    },
    currentValue: {
      type: Number,
      min: [0, 'Current value cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      enum: ['hours', 'problems', 'commits', 'lessons', 'tasks', 'days'],
      default: 'hours',
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

GoalSchema.pre('save', function (next) {
  if (this.currentValue >= this.targetValue && this.status === 'Active') {
    this.status = 'Completed';
    this.completedAt = this.completedAt || new Date();
  } else if (this.currentValue < this.targetValue && this.status === 'Completed') {
    this.status = 'Active';
    this.completedAt = null;
  }
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);
