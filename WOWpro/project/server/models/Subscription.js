/**
 * ═══════════════════════════════════════════════════════
 *  Subscription Model  ·  Monthly/Annual Plans
 * ═══════════════════════════════════════════════════════
 *  • Monthly & yearly subscription tiers
 *  • Status tracking: active, expired, cancelled
 *  • Discount percentage applied to bookings
 */

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['monthly_basic', 'monthly_pro', 'annual_basic', 'annual_pro']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  servicesIncluded: {
    type: Number,
    default: 0
  },
  servicesUsed: {
    type: Number,
    default: 0
  },
  paymentId: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-expire subscriptions
subscriptionSchema.methods.isActive = function () {
  return this.status === 'active' && this.endDate > Date.now();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
