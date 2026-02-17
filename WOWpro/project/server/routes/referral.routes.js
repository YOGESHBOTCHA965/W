/**
 * ═══════════════════════════════════════════════════════
 *  Referral & Loyalty Routes  ·  /api/referral/*
 * ═══════════════════════════════════════════════════════
 *  GET  /my          : get user's referral info + points (auth)
 *  POST /apply       : apply referral code during signup (auth)
 *  GET  /leaderboard : top referrers (no auth, anonymized)
 *
 *  Security:
 *   • Users cannot refer themselves
 *   • Referral codes are validated against DB
 *   • Points changes are server-side only
 */

const express  = require('express');
const { body } = require('express-validator');
const Referral = require('../models/Referral');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Points config
const POINTS = {
  WELCOME_BONUS: 50,
  REFERRAL_BONUS_REFERRER: 100,
  REFERRAL_BONUS_REFEREE: 50,
  BOOKING_REWARD_STANDARD: 25,
  BOOKING_REWARD_PREMIUM: 50,
  BOOKING_REWARD_PRO: 100
};

// ═══════════════════════════════════════
//  GET /api/referral/my : User's referral & loyalty info
// ═══════════════════════════════════════
router.get('/my', protect, async (req, res) => {
  try {
    let referral = await Referral.findOne({ userId: req.user.id });

    // Auto-create referral profile if doesn't exist
    if (!referral) {
      referral = await Referral.create({
        userId: req.user.id,
        loyaltyPoints: POINTS.WELCOME_BONUS,
        totalPointsEarned: POINTS.WELCOME_BONUS,
        pointsHistory: [{
          type: 'welcome_bonus',
          amount: POINTS.WELCOME_BONUS,
          description: 'Welcome bonus for joining WOW!'
        }]
      });
    }

    res.json({
      success: true,
      referral: {
        referralCode: referral.referralCode,
        referralCount: referral.referralCount,
        loyaltyPoints: referral.loyaltyPoints,
        totalPointsEarned: referral.totalPointsEarned,
        totalPointsRedeemed: referral.totalPointsRedeemed,
        pointsHistory: referral.pointsHistory.slice(-20)  // last 20 entries
      }
    });
  } catch (err) {
    console.error('[MyReferral]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  POST /api/referral/apply : Apply a referral code
// ═══════════════════════════════════════
router.post('/apply', protect, [
  body('referralCode').trim().notEmpty().withMessage('Referral code is required.')
    .isLength({ min: 9, max: 9 }).withMessage('Invalid referral code format.')
], async (req, res) => {
  try {
    const { referralCode } = req.body;

    // Find the referrer's profile
    const referrerProfile = await Referral.findOne({
      referralCode: referralCode.toUpperCase()
    });

    if (!referrerProfile) {
      return res.status(404).json({ success: false, message: 'Invalid referral code.' });
    }

    // Cannot refer yourself
    if (referrerProfile.userId.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot use your own referral code.' });
    }

    // Check if user already used a referral code
    let userProfile = await Referral.findOne({ userId: req.user.id });
    if (!userProfile) {
      userProfile = await Referral.create({ userId: req.user.id });
    }

    if (userProfile.referredBy) {
      return res.status(400).json({ success: false, message: 'You have already used a referral code.' });
    }

    // Apply referral: reward both parties
    userProfile.referredBy = referrerProfile.userId;
    userProfile.loyaltyPoints += POINTS.REFERRAL_BONUS_REFEREE;
    userProfile.totalPointsEarned += POINTS.REFERRAL_BONUS_REFEREE;
    userProfile.pointsHistory.push({
      type: 'referral_bonus',
      amount: POINTS.REFERRAL_BONUS_REFEREE,
      description: `Referral bonus (welcome gift!)`
    });
    await userProfile.save();

    referrerProfile.referralCount += 1;
    referrerProfile.loyaltyPoints += POINTS.REFERRAL_BONUS_REFERRER;
    referrerProfile.totalPointsEarned += POINTS.REFERRAL_BONUS_REFERRER;
    referrerProfile.pointsHistory.push({
      type: 'referral_bonus',
      amount: POINTS.REFERRAL_BONUS_REFERRER,
      description: `Referral reward: someone used your code!`
    });
    await referrerProfile.save();

    res.json({
      success: true,
      message: `Referral applied! You earned ${POINTS.REFERRAL_BONUS_REFEREE} points!`,
      pointsEarned: POINTS.REFERRAL_BONUS_REFEREE
    });
  } catch (err) {
    console.error('[ApplyReferral]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════
//  GET /api/referral/leaderboard : Top referrers
// ═══════════════════════════════════════
router.get('/leaderboard', async (_req, res) => {
  try {
    const leaders = await Referral.find({ referralCount: { $gt: 0 } })
      .populate('userId', 'firstName lastName')
      .sort({ referralCount: -1 })
      .limit(10);

    const safeLeaders = leaders.map((r, i) => ({
      rank: i + 1,
      name: r.userId ? `${r.userId.firstName} ${r.userId.lastName.charAt(0)}.` : 'WOW User',
      referrals: r.referralCount,
      points: r.totalPointsEarned
    }));

    res.json({ success: true, leaderboard: safeLeaders });
  } catch (err) {
    console.error('[Leaderboard]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
module.exports.POINTS = POINTS;
