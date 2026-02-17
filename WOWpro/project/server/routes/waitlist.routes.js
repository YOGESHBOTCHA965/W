/**
 * ═══════════════════════════════════════════════════════
 *  Waitlist Routes  ·  /api/waitlist/*
 * ═══════════════════════════════════════════════════════
 *  POST /join     : join waitlist for a city (public)
 *  GET  /count    : get waitlist counts per city (public)
 *
 *  Security:
 *   • Email format validation
 *   • Duplicate prevention via compound unique index
 *   • Rate limited at app level
 */

const express  = require('express');
const { body, validationResult } = require('express-validator');
const Waitlist = require('../models/Waitlist');

const router = express.Router();

// ═══════════════════════════════════════
//  POST /api/waitlist/join
// ═══════════════════════════════════════
router.post('/join', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('city').trim().notEmpty().isLength({ max: 100 }).withMessage('City is required.'),
  body('name').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const { email, city, name } = req.body;

    // Check if already on waitlist for this city
    const exists = await Waitlist.findOne({
      email: email.toLowerCase(),
      city: city.toLowerCase()
    });

    if (exists) {
      return res.json({
        success: true,
        message: "You're already on the waitlist for this city! We'll notify you."
      });
    }

    await Waitlist.create({
      email: email.toLowerCase(),
      city: city.toLowerCase(),
      name: name || ''
    });

    res.status(201).json({
      success: true,
      message: `You're on the waitlist for ${city}! We'll notify you when we launch.`
    });
  } catch (err) {
    console.error('[JoinWaitlist]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/waitlist/count
// ═══════════════════════════════════════
router.get('/count', async (_req, res) => {
  try {
    const counts = await Waitlist.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      cities: counts.map(c => ({ city: c._id, count: c.count }))
    });
  } catch (err) {
    console.error('[WaitlistCount]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
