/**
 * ═══════════════════════════════════════════════════════
 *  JWT Authentication Middleware
 * ═══════════════════════════════════════════════════════
 *  • Verifies access token from Authorization header
 *  • Attaches decoded user payload to req.user
 *  • Short-lived tokens (15 min) + refresh token rotation
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start without it.');
}

/**
 * Middleware: Protect routes, requires valid Bearer token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please refresh.',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    // Check user still exists (not deleted)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Attach user to request
    req.user = {
      id:    user._id,
      email: user.emailId,
      name:  user.firstName + ' ' + user.lastName
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

/**
 * Generate access token (short-lived: 15 min)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate refresh token (long-lived: 7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = { protect, generateAccessToken, generateRefreshToken };
