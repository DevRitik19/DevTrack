const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT and set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
    console.warn('[DevTrack Security] Warning: JWT_SECRET should be a strong cryptographically random string in production.');
  }

  const secret = process.env.JWT_SECRET || 'devtrack_super_secure_jwt_secret_dev_key_2026_xyz';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };

  // Convert mongoose doc to object and sanitize password if present
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.__v;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token, // Also provided for testing or non-browser clients
      user: userObj,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if email or username already taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      name: name || username,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    let user = await User.findOne({ email }).select('+password');

    // On-demand fallback: If demo user does not exist yet and demo credentials provided, seed on-the-fly
    if (!user && email === 'demo@devtrack.io' && password === 'password123') {
      try {
        const { populateDemoData } = require('../seed');
        await populateDemoData();
        user = await User.findOne({ email }).select('+password');
      } catch (seedErr) {
        console.warn('[DevTrack] Demo on-demand seed notice:', seedErr.message);
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  };

  res.clearCookie('token', cookieOptions);
  res.cookie('token', 'none', {
    ...cookieOptions,
    expires: new Date(Date.now() + 1000),
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
