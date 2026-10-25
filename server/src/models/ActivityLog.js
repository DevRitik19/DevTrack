const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
      default: Date.now,
      index: true,
    },
    minutesSpent: {
      type: Number,
      required: [true, 'Time spent in minutes is required'],
      min: [1, 'Must record at least 1 minute'],
      max: [1440, 'Cannot exceed 24 hours (1440 minutes)'],
      default: 60,
    },
    type: {
      type: String,
      enum: ['Coding', 'LeetCode Practice', 'Learning', 'Project Work', 'Bug Fix', 'System Design', 'Other'],
      default: 'Coding',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    // Optional fields for LeetCode practice logs
    problemTitle: {
      type: String,
      trim: true,
      default: '',
    },
    problemDifficulty: {
      type: String,
      enum: ['', 'Easy', 'Medium', 'Hard'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
