/**
 * ═══════════════════════════════════════════════════════
 *  Review Model  ·  Rating & Review System
 * ═══════════════════════════════════════════════════════
 *  • Users rate bookings 1-5 stars after completion
 *  • One review per booking (enforced by unique index)
 *  • Reviews displayed on homepage for social proof
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true  // one review per booking
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'bicycle']
  },
  servicePlan: {
    type: String,
    enum: ['standard', 'premium', 'pro']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
