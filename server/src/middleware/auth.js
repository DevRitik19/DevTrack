const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = null;

  // Prefer HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devtrack_super_secure_jwt_secret_dev_key_2026_xyz');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired token',
    });
  }
};

module.exports = { protect };
