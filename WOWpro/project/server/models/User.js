/**
 * ═══════════════════════════════════════════════════════
 *  User Model  ·  Security Features
 * ═══════════════════════════════════════════════════════
 *  • bcrypt 12-round hashing for password + security answer
 *  • Account lockout after 5 failed login attempts (30 min)
 *  • OTP with expiry for email-based password reset
 *  • toJSON transform strips sensitive fields
 *  • Mongoose unique + lowercase indexing on email
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dob: {
    type: String,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  contactNo: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^\d{10}$/, 'Contact number must be 10 digits']
  },
  emailId: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false   // never returned in queries by default
  },
  securityQuestion: {
    type: String,
    required: [true, 'Security question is required']
  },
  securityAnswer: {
    type: String,
    required: [true, 'Security answer is required'],
    select: false   // never returned in queries by default
  },

  // ─── Account Lockout ───
  loginAttempts: { type: Number, default: 0 },
  lockUntil:    { type: Date,   default: null },

  // ─── Email OTP for password reset ───
  resetOtp:       { type: String, select: false },
  resetOtpExpiry: { type: Date,   select: false },

  // ─── Refresh Token (stored hashed) ───
  refreshToken: { type: String, select: false }

}, {
  timestamps: true  // createdAt, updatedAt
});

// ═══════ PRE-SAVE: Hash password + security answer ═══════
userSchema.pre('save', async function (next) {
  // Hash password only if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }
  // Hash security answer only if modified (store lowercase for case-insensitive compare)
  if (this.isModified('securityAnswer')) {
    const normalized = this.securityAnswer.trim().toLowerCase();
    this.securityAnswer = await bcrypt.hash(normalized, SALT_ROUNDS);
  }
  next();
});

// ═══════ INSTANCE METHODS ═══════

/** Compare plain-text password against stored bcrypt hash */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/** Compare plain-text security answer against stored bcrypt hash */
userSchema.methods.compareSecurityAnswer = async function (candidateAnswer) {
  const normalized = candidateAnswer.trim().toLowerCase();
  return bcrypt.compare(normalized, this.securityAnswer);
};

/** Check if account is currently locked */
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/** Increment failed login attempts; lock after 5 */
userSchema.methods.incrementLoginAttempts = async function () {
  // If previous lock has expired, reset counter
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set:   { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock for 30 minutes after 5 attempts
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

/** Reset login attempts on successful login */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set:   { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// ═══════ toJSON TRANSFORM: Strip sensitive fields ═══════
userSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.securityAnswer;
    delete ret.resetOtp;
    delete ret.resetOtpExpiry;
    delete ret.refreshToken;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
