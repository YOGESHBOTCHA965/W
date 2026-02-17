/**
 * ═══════════════════════════════════════════════════════
 *  Referral Model  ·  Referral & Loyalty Points
 * ═══════════════════════════════════════════════════════
 *  • Each user gets a unique referral code on registration
 *  • Referrer + referee both earn bonus points
 *  • Points earned on bookings, redeemable for discounts
 */

const mongoose = require('mongoose');
const crypto   = require('crypto');

const referralSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  referralCode: {
    type: String,
    unique: true,
    uppercase: true,
    index: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0
  },
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'referral_bonus', 'welcome_bonus', 'booking_reward'],
      required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, maxlength: 200 },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Generate unique referral code before save
referralSchema.pre('save', function (next) {
  if (!this.referralCode) {
    // Generate WOW + 6 random alphanumeric chars
    this.referralCode = 'WOW' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Referral', referralSchema);
