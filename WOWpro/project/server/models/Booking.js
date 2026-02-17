/**
 * ═══════════════════════════════════════════════════════
 *  Booking Model
 * ═══════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['bike', 'bicycle']
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  servicePlan: {
    type: String,
    required: true,
    enum: ['standard', 'premium', 'pro']
  },
  slotDate: {
    type: Date,
    required: true
  },
  slotTime: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']
  },
  paymentStatus: {
    type: String,
    default: 'unpaid',
    enum: ['unpaid', 'paid', 'refunded']
  },
  paymentId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, maxlength: 200 }
  }],
  estimatedCompletion: {
    type: Date,
    default: null
  },
  mechanicName: {
    type: String,
    default: null,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
