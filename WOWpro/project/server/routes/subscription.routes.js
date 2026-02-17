/**
 * ═══════════════════════════════════════════════════════
 *  Subscription Routes  ·  /api/subscription/*
 * ═══════════════════════════════════════════════════════
 *  GET  /plans     : list available plans (public)
 *  POST /subscribe : subscribe to a plan (auth)
 *  GET  /my        : get user's active subscription (auth)
 *  POST /cancel    : cancel subscription (auth)
 *
 *  Security:
 *   • Auth required for all write operations
 *   • Ownership verification on cancel
 *   • Server-side pricing (client cannot set amount)
 */

const express  = require('express');
const { body } = require('express-validator');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Plan definitions (single source of truth, server-side)
const PLANS = {
  monthly_basic: {
    name: 'Monthly Basic',
    price: 19,
    duration: 30,
    discount: 10,
    servicesIncluded: 2,
    features: ['2 standard services/month', '10% off all bookings', 'Priority booking', 'Free chain lube']
  },
  monthly_pro: {
    name: 'Monthly Pro',
    price: 39,
    duration: 30,
    discount: 20,
    servicesIncluded: 4,
    features: ['4 services/month (any tier)', '20% off all bookings', 'Priority booking', 'Free pickup & drop', 'Free chain & brake adjustment']
  },
  annual_basic: {
    name: 'Annual Basic',
    price: 199,
    duration: 365,
    discount: 15,
    servicesIncluded: 24,
    features: ['24 standard services/year', '15% off all bookings', 'Priority booking', 'Free chain lube', '2 free premium services']
  },
  annual_pro: {
    name: 'Annual Pro',
    price: 399,
    duration: 365,
    discount: 30,
    servicesIncluded: 48,
    features: ['48 services/year (any tier)', '30% off all bookings', 'VIP priority', 'Free pickup & drop', 'Unlimited chain & brake', '4 free pro services']
  }
};

// ═══════════════════════════════════════
//  GET /api/subscription/plans : List plans
// ═══════════════════════════════════════
router.get('/plans', (_req, res) => {
  const planList = Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    ...plan
  }));
  res.json({ success: true, plans: planList });
});

// ═══════════════════════════════════════
//  POST /api/subscription/subscribe
// ═══════════════════════════════════════
router.post('/subscribe', protect, [
  body('plan').trim().notEmpty().isIn(Object.keys(PLANS)).withMessage('Invalid plan selected.')
], async (req, res) => {
  try {
    const { plan } = req.body;
    const planInfo = PLANS[plan];

    // Check if user already has an active subscription
    const existing = await Subscription.findOne({
      userId: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription. Cancel it first to switch plans.'
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planInfo.duration);

    const subscription = await Subscription.create({
      userId: req.user.id,
      plan,
      status: 'active',
      startDate,
      endDate,
      amount: planInfo.price,
      discount: planInfo.discount,
      servicesIncluded: planInfo.servicesIncluded,
      servicesUsed: 0
    });

    res.status(201).json({
      success: true,
      message: `Subscribed to ${planInfo.name} successfully!`,
      subscription
    });
  } catch (err) {
    console.error('[Subscribe]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/subscription/my
// ═══════════════════════════════════════
router.get('/my', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    res.json({
      success: true,
      hasSubscription: !!subscription,
      subscription: subscription || null,
      plans: Object.entries(PLANS).map(([key, plan]) => ({ id: key, ...plan }))
    });
  } catch (err) {
    console.error('[MySub]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/subscription/cancel
// ═══════════════════════════════════════
router.post('/cancel', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found.' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully.'
    });
  } catch (err) {
    console.error('[CancelSub]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
