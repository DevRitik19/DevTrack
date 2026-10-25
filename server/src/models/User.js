const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    githubUsername: {
      type: String,
      trim: true,
      default: '',
    },
    leetcodeStats: {
      username: { type: String, trim: true, default: '' },
      profileUrl: { type: String, trim: true, default: '' },
      easy: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      hard: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
      ranking: { type: Number, default: 0 },
      avatar: { type: String, default: '' },
      lastUpdated: { type: Date, default: null },
      isUserReported: { type: Boolean, default: true },
    },
    publicProfileSettings: {
      isPublic: { type: Boolean, default: true },
      showLeetCode: { type: Boolean, default: true },
      showGitHub: { type: Boolean, default: true },
      showSkills: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password prior to saving if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
