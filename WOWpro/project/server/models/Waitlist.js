/**
 * ═══════════════════════════════════════════════════════
 *  Waitlist Model  ·  Multi-City Expansion
 * ═══════════════════════════════════════════════════════
 *  • Users join a waitlist for cities not yet served
 *  • Helps gauge demand for expansion decisions
 */

const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: 100
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

// Prevent duplicate entries per email+city
waitlistSchema.index({ email: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
