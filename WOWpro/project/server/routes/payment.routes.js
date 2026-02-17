/**
 * ═══════════════════════════════════════════════════════
 *  Payment Routes  ·  /api/payment/*
 * ═══════════════════════════════════════════════════════
 *
 *  POST /process   : process payment for a booking (auth required)
 *
 *  NOTE: This is a simulated payment flow. In production,
 *  integrate Razorpay / Stripe and verify webhooks server-side.
 *  Never trust the client for payment confirmation.
 */

const express = require('express');
const crypto  = require('crypto');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// ═══════════════════════════════════════
//  POST /api/payment/process
// ═══════════════════════════════════════
router.post('/process', [
  body('bookingId').notEmpty().withMessage('Booking ID is required.'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required.')
    .isIn(['card', 'upi', 'netbanking', 'wallet', 'test']).withMessage('Invalid payment method.')
], async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id  // enforce ownership
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid.' });
    }

    // ─── Simulated payment processing ───
    // In production: call Razorpay create order → verify webhook signature
    const paymentId = 'WOW_' + crypto.randomBytes(8).toString('hex').toUpperCase();

    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment processed successfully!',
      paymentId,
      booking
    });
  } catch (err) {
    console.error('[ProcessPayment]', err.message);
    res.status(500).json({ success: false, message: 'Server error during payment processing.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/payment/skip  (Test mode only)
// ═══════════════════════════════════════
router.post('/skip', [
  body('bookingId').notEmpty().withMessage('Booking ID is required.')
], async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Test mode not available in production.' });
    }

    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentId = 'TEST_SKIP_' + Date.now();
    await booking.save();

    res.json({
      success: true,
      message: 'Payment skipped (Test Mode).',
      booking
    });
  } catch (err) {
    console.error('[SkipPayment]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
