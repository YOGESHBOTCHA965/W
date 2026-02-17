/**
 * ═══════════════════════════════════════════════════════
 *  Input Validators  ·  express-validator rules
 * ═══════════════════════════════════════════════════════
 *  Centralized validation rules for all auth endpoints.
 *  Prevents malformed / malicious input from reaching DB.
 */

const { body, validationResult } = require('express-validator');

// ─── Helper: handle validation result ───
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,     // return first error only
      errors:  errors.array()              // full list for debugging
    });
  }
  next();
};

// ─── Registration validators ───
const registerValidation = [
  body('firstName')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: 50 }).withMessage('First name max 50 chars.')
    .matches(/^[A-Za-z\s]+$/).withMessage('First name: letters only.'),

  body('lastName')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: 50 }).withMessage('Last name max 50 chars.')
    .matches(/^[A-Za-z\s]+$/).withMessage('Last name: letters only.'),

  body('dob')
    .notEmpty().withMessage('Date of birth is required.')
    .isISO8601().withMessage('Invalid date format.'),

  body('gender')
    .notEmpty().withMessage('Gender is required.')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender value.'),

  body('contactNo')
    .trim().notEmpty().withMessage('Contact number is required.')
    .matches(/^\d{10}$/).withMessage('Contact must be exactly 10 digits.'),

  body('emailId')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character.'),

  body('securityQuestion')
    .trim().notEmpty().withMessage('Security question is required.'),

  body('securityAnswer')
    .trim().notEmpty().withMessage('Security answer is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Security answer max 100 chars.'),

  handleValidation
];

// ─── Login validators ───
const loginValidation = [
  body('emailId')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidation
];

// ─── Forgot Password Step 1: email ───
const forgotEmailValidation = [
  body('emailId')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  handleValidation
];

// ─── Forgot Password Step 2: verify OTP ───
const verifyOtpValidation = [
  body('emailId')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  body('otp')
    .trim().notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.')
    .isNumeric().withMessage('OTP must contain only digits.'),

  handleValidation
];

// ─── Forgot Password Step 2b: verify security answer + DOB ───
const verifyIdentityValidation = [
  body('emailId')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  body('securityAnswer')
    .trim().notEmpty().withMessage('Security answer is required.'),

  body('dob')
    .notEmpty().withMessage('Date of birth is required.')
    .isISO8601().withMessage('Invalid date format.'),

  handleValidation
];

// ─── Reset Password ───
const resetPasswordValidation = [
  body('emailId')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character.'),

  body('resetToken')
    .trim().notEmpty().withMessage('Reset token is required.'),

  handleValidation
];

// ─── Booking validators ───
const bookingValidation = [
  body('vehicleType')
    .notEmpty().withMessage('Vehicle type is required.')
    .isIn(['bike', 'bicycle']).withMessage('Invalid vehicle type.'),

  body('brand')
    .trim().notEmpty().withMessage('Brand is required.')
    .isLength({ max: 100 }).withMessage('Brand max 100 chars.'),

  body('model')
    .trim().notEmpty().withMessage('Model is required.')
    .isLength({ max: 100 }).withMessage('Model max 100 chars.'),

  body('servicePlan')
    .notEmpty().withMessage('Service plan is required.')
    .isIn(['standard', 'premium', 'pro']).withMessage('Invalid service plan.'),

  body('slotDate')
    .notEmpty().withMessage('Slot date is required.')
    .isISO8601().withMessage('Invalid date format.'),

  body('slotTime')
    .trim().notEmpty().withMessage('Slot time is required.'),

  handleValidation
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotEmailValidation,
  verifyOtpValidation,
  verifyIdentityValidation,
  resetPasswordValidation,
  bookingValidation
};
