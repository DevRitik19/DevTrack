const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed'],
      default: 'Planned',
      index: true,
    },
    completionPercentage: {
      type: Number,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot exceed 100'],
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-adjust status if completion percentage is 100
ProjectSchema.pre('save', function (next) {
  if (this.completionPercentage === 100 && this.status !== 'Completed') {
    this.status = 'Completed';
  } else if (this.status === 'Completed' && this.completionPercentage < 100) {
    this.completionPercentage = 100;
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
