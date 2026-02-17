/**
 * ═══════════════════════════════════════════════════════
 *  Booking Routes  ·  /api/booking/*
 * ═══════════════════════════════════════════════════════
 *
 *  POST /           : create a new booking  (auth required)
 *  POST /sos        : emergency SOS booking (auth required)
 *  GET  /           : list user's bookings   (auth required)
 *  GET  /:id        : get single booking     (auth required, own only)
 *  GET  /:id/track  : live status tracking   (auth required, own only)
 *  PATCH /:id/cancel : cancel a booking      (auth required, own only)
 */

const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth.middleware');
const { bookingValidation } = require('../middleware/validators');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// ═══════════════════════════════════════
//  POST /api/booking  : Create booking
// ═══════════════════════════════════════
router.post('/', bookingValidation, async (req, res) => {
  try {
    const { vehicleType, brand, model, servicePlan, slotDate, slotTime, address, notes } = req.body;

    // Calculate price based on plan
    const prices = { standard: 49, premium: 99, pro: 199 };
    const amount = prices[servicePlan] || 49;

    const booking = await Booking.create({
      userId: req.user.id,
      vehicleType,
      brand,
      model,
      servicePlan,
      slotDate,
      slotTime,
      address: address || '',
      notes: notes || '',
      amount,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking
    });
  } catch (err) {
    console.error('[CreateBooking]', err.message);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(' ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/booking/sos  : Emergency SOS Booking
// ═══════════════════════════════════════
router.post('/sos', async (req, res) => {
  try {
    const { vehicleType, brand, model, address, notes, contactNo } = req.body;

    if (!vehicleType || !address) {
      return res.status(400).json({ success: false, message: 'Vehicle type and address are required for SOS.' });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      vehicleType: vehicleType || 'bike',
      brand: brand || 'Unknown',
      model: model || 'Unknown',
      servicePlan: 'premium',
      slotDate: new Date(),
      slotTime: 'ASAP',
      address,
      notes: `🆘 EMERGENCY SOS: ${notes || 'Urgent roadside assistance needed'}. Contact: ${contactNo || 'N/A'}`,
      amount: 99,
      status: 'confirmed',
      isEmergency: true,
      statusHistory: [{
        status: 'confirmed',
        note: 'Emergency SOS: priority dispatch initiated'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'SOS request received! A mechanic is being dispatched immediately.',
      booking
    });
  } catch (err) {
    console.error('[SOSBooking]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/booking  : List user's bookings
// ═══════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    // Users can only see their own bookings
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('[ListBookings]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/booking/:id  : Get single booking
// ═══════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id  // enforce ownership
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error('[GetBooking]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/booking/:id/track  : Live status tracking
// ═══════════════════════════════════════
router.get('/:id/track', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('status statusHistory estimatedCompletion mechanicName isEmergency slotDate slotTime vehicleType servicePlan');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Define tracking steps
    const allSteps = ['pending', 'confirmed', 'in-progress', 'completed'];
    const currentIndex = allSteps.indexOf(booking.status);

    res.json({
      success: true,
      tracking: {
        currentStatus: booking.status,
        isEmergency: booking.isEmergency,
        mechanicName: booking.mechanicName,
        estimatedCompletion: booking.estimatedCompletion,
        steps: allSteps.map((step, i) => ({
          name: step,
          label: step.charAt(0).toUpperCase() + step.slice(1).replace('-', ' '),
          completed: i <= currentIndex,
          current: i === currentIndex
        })),
        history: booking.statusHistory || []
      }
    });
  } catch (err) {
    console.error('[TrackBooking]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  PATCH /api/booking/:id/cancel  : Cancel booking
// ═══════════════════════════════════════
router.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id  // enforce ownership
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (err) {
    console.error('[CancelBooking]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
