/**
 * ═══════════════════════════════════════════════════════
 *  Review Routes  ·  /api/review/*
 * ═══════════════════════════════════════════════════════
 *  POST /           : submit a review for a completed booking (auth)
 *  GET  /my         : get user's own reviews (auth)
 *  GET  /public     : get latest public reviews (no auth)
 *  GET  /stats      : get overall rating stats (no auth)
 *
 *  Security:
 *   • Only completed bookings can be reviewed
 *   • One review per booking (DB unique constraint)
 *   • Input validation on rating + comment
 *   • Ownership verification on bookings
 */

const express  = require('express');
const { body } = require('express-validator');
const Review   = require('../models/Review');
const Booking  = require('../models/Booking');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ─── Validation rules ───
const reviewValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required.'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters.')
    .escape()  // XSS prevention: escape HTML entities
];

// ═══════════════════════════════════════
//  POST /api/review : Submit a review
// ═══════════════════════════════════════
router.post('/', protect, reviewValidation, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify booking exists, belongs to user, and is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed or confirmed bookings.'
      });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    const review = await Review.create({
      userId: req.user.id,
      bookingId,
      rating,
      comment: comment || '',
      vehicleType: booking.vehicleType,
      servicePlan: booking.servicePlan
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already reviewed.' });
    }
    console.error('[CreateReview]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/review/my : User's reviews
// ═══════════════════════════════════════
router.get('/my', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate('bookingId', 'brand model vehicleType servicePlan slotDate')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error('[MyReviews]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/review/public : Latest reviews (no auth)
// ═══════════════════════════════════════
router.get('/public', async (_req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 3 } })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);

    // Strip sensitive data
    const safeReviews = reviews.map(r => ({
      _id: r._id,
      rating: r.rating,
      comment: r.comment,
      vehicleType: r.vehicleType,
      servicePlan: r.servicePlan,
      userName: r.userId ? `${r.userId.firstName} ${r.userId.lastName.charAt(0)}.` : 'WOW User',
      createdAt: r.createdAt
    }));

    res.json({ success: true, reviews: safeReviews });
  } catch (err) {
    console.error('[PublicReviews]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/review/stats : Overall rating stats
// ═══════════════════════════════════════
router.get('/stats', async (_req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      avgRating: 0, totalReviews: 0,
      five: 0, four: 0, three: 0, two: 0, one: 0
    };

    res.json({
      success: true,
      stats: {
        avgRating: Math.round(result.avgRating * 10) / 10,
        totalReviews: result.totalReviews,
        distribution: {
          5: result.five, 4: result.four, 3: result.three,
          2: result.two, 1: result.one
        }
      }
    });
  } catch (err) {
    console.error('[ReviewStats]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
