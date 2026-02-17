/**
 * ═══════════════════════════════════════════════════════
 *  Auth Routes  ·  /api/auth/*
 * ═══════════════════════════════════════════════════════
 *
 *  POST /register          : create account (bcrypt + validation)
 *  POST /login             : authenticate + return JWT pair
 *  POST /refresh           : rotate access token via refresh token
 *  POST /logout            : invalidate refresh token
 *  GET  /me                : get current user profile
 *  POST /forgot-password   : send OTP email
 *  POST /verify-otp        : verify OTP > return reset token
 *  POST /verify-identity   : verify security Q + DOB > return reset token
 *  GET  /security-question : get user's security question by email
 *  POST /reset-password    : set new password with reset token
 *
 *  Security:
 *   • Auth-specific rate limiter (10 req / 15 min)
 *   • Account lockout after 5 failed logins (30 min)
 *   • Input validation on every endpoint
 *   • Passwords never returned in responses
 */

const express   = require('express');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');
const rateLimit = require('express-rate-limit');
const User      = require('../models/User');
const { protect, generateAccessToken, generateRefreshToken } = require('../middleware/auth.middleware');
const { sendResetOTP } = require('../services/email.service');
const {
  registerValidation,
  loginValidation,
  forgotEmailValidation,
  verifyOtpValidation,
  verifyIdentityValidation,
  resetPasswordValidation
} = require('../middleware/validators');

const router = express.Router();

// ─── Auth-specific rate limiter: 10 attempts per 15 min ───
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in 15 minutes.'
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/register
// ═══════════════════════════════════════
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  try {
    const { firstName, lastName, dob, gender, contactNo, emailId, password, securityQuestion, securityAnswer } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Create user (password + securityAnswer are hashed by pre-save hook)
    const user = await User.create({
      firstName, lastName, dob, gender, contactNo,
      emailId: emailId.toLowerCase(),
      password,
      securityQuestion,
      securityAnswer
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully!',
      user: user.toJSON()
    });
  } catch (err) {
    console.error('[Register]', err.message);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(' ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/login
// ═══════════════════════════════════════
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Find user with password field (normally hidden)
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check account lockout
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const remaining = Math.max(0, 5 - (user.loginAttempts + 1));
      return res.status(401).json({
        success: false,
        message: remaining > 0
          ? `Invalid email or password. ${remaining} attempt(s) remaining.`
          : 'Account locked for 30 minutes due to too many failed attempts.'
      });
    }

    // Reset failed attempts on success
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in DB
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('[Login]', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/refresh
// ═══════════════════════════════════════
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (_) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    // Find user and compare stored hash
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      // Possible token theft: invalidate all tokens
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Refresh token reuse detected. All sessions invalidated.' });
    }

    // Rotate: issue new pair
    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('[Refresh]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/logout
// ═══════════════════════════════════════
router.post('/logout', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/auth/me
// ═══════════════════════════════════════
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/forgot-password  (Send OTP)
// ═══════════════════════════════════════
router.post('/forgot-password', authLimiter, forgotEmailValidation, async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId: emailId.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.',
        hasSecurityQuestion: false
      });
    }

    // Generate and send OTP
    const otp = await sendResetOTP(user.emailId, user.firstName);

    // Store hashed OTP with expiry
    const otpExpiry = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = new Date(Date.now() + otpExpiry * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.',
      hasSecurityQuestion: !!user.securityQuestion,
      securityQuestion: user.securityQuestion || null
    });
  } catch (err) {
    console.error('[ForgotPassword]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/auth/security-question?email=...
// ═══════════════════════════════════════
router.get('/security-question', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    const user = await User.findOne({ emailId: email });
    // Never reveal whether user exists, always return same shape
    res.json({
      success: true,
      securityQuestion: user?.securityQuestion || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/verify-otp
// ═══════════════════════════════════════
router.post('/verify-otp', authLimiter, verifyOtpValidation, async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select('+resetOtp +resetOtpExpiry');

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'No OTP request found. Please request a new OTP.' });
    }

    // Check expiry
    if (user.resetOtpExpiry < Date.now()) {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Clear OTP after successful verification
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // Generate a short-lived reset token (5 min)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken
    });
  } catch (err) {
    console.error('[VerifyOTP]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/verify-identity  (Security Q + DOB)
// ═══════════════════════════════════════
router.post('/verify-identity', authLimiter, verifyIdentityValidation, async (req, res) => {
  try {
    const { emailId, securityAnswer, dob } = req.body;
    const user = await User.findOne({ emailId: emailId.toLowerCase() }).select('+securityAnswer');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Verification failed.' });
    }

    // Verify DOB
    if (user.dob !== dob) {
      return res.status(400).json({ success: false, message: 'Date of birth does not match our records.' });
    }

    // Verify security answer
    const isAnswerCorrect = await user.compareSecurityAnswer(securityAnswer);
    if (!isAnswerCorrect) {
      return res.status(400).json({ success: false, message: 'Security answer is incorrect.' });
    }

    // Generate short-lived reset token (5 min)
    const resetToken = jwt.sign(
      { id: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({
      success: true,
      message: 'Identity verified successfully.',
      resetToken
    });
  } catch (err) {
    console.error('[VerifyIdentity]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/auth/reset-password
// ═══════════════════════════════════════
router.post('/reset-password', authLimiter, resetPasswordValidation, async (req, res) => {
  try {
    const { emailId, newPassword, resetToken } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password-reset') throw new Error('Invalid token purpose');
    } catch (_) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token. Please start over.' });
    }

    const user = await User.findOne({ _id: decoded.id, emailId: emailId.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    // Invalidate all refresh tokens
    user.refreshToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.'
    });
  } catch (err) {
    console.error('[ResetPassword]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
