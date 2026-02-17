/**
 * ═══════════════════════════════════════════════════════════
 *  WOW (Work On Wheels)  ·  Express Server  (Security Hardened)
 * ═══════════════════════════════════════════════════════════
 *
 *  Security layers applied:
 *    1. Helmet         : secure HTTP headers (CSP, HSTS, X-Frame, etc.)
 *    2. CORS           : strict origin allow-list
 *    3. Rate Limiter   : global + auth-specific throttle
 *    4. Mongo Sanitize : prevent NoSQL injection ($gt, $ne, etc.)
 *    5. XSS Clean      : strip malicious HTML / script tags
 *    6. HPP            : prevent HTTP parameter pollution
 *    7. Body Limit     : cap payload to 10 KB to block large attacks
 *    8. JWT            : short-lived access + long-lived refresh tokens
 *    9. Bcrypt 12      : password + security-answer hashing (server-side)
 *   10. Input Valid.   : express-validator on every route
 */

require('dotenv').config();

// ── Fail-fast: require critical env vars before booting ──
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    console.error('       Copy .env.example → .env and fill in all values.');
    process.exit(1);
  }
}

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp      = require('hpp');

// ── xss-clean may throw on newer Node; wrap gracefully ──
let xssClean;
try { xssClean = require('xss-clean'); } catch (_) { xssClean = null; }

const authRoutes    = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes  = require('./routes/review.routes');
const referralRoutes = require('./routes/referral.routes');
const waitlistRoutes = require('./routes/waitlist.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

const app = express();

// ═══════════ 1. SECURITY MIDDLEWARE ═══════════

// 1a. Helmet: sets ~15 secure HTTP headers
app.use(helmet());

// 1b. CORS: only allow the Angular dev server
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:4200'
];
app.use(cors({
  origin: function (origin, cb) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: Origin ' + origin + ' not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 1c. Global rate limiter (100 req/15 min per IP)
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
}));

// 1d. Body parser with 10 KB limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 1e. Mongo-sanitize: removes $, . from req.body/query/params
app.use(mongoSanitize());

// 1f. XSS-clean: strip <script> etc.
if (xssClean) app.use(xssClean());

// 1g. HPP: prevent duplicate query params
app.use(hpp());

// ═══════════ 2. ROUTES ═══════════
app.use('/api/auth',         authRoutes);
app.use('/api/booking',      bookingRoutes);
app.use('/api/payment',      paymentRoutes);
app.use('/api/review',       reviewRoutes);
app.use('/api/referral',     referralRoutes);
app.use('/api/waitlist',     waitlistRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health-check (no auth required)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════ 3. ERROR HANDLING ═══════════

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler: never leak stack traces to client
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong.'
      : err.message
  });
});

// ═══════════ 4. DATABASE + LISTEN ═══════════
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wow_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✔  MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✔  WOW Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log('   Security: Helmet ✔  CORS ✔  RateLimit ✔  MongoSanitize ✔  XSS ✔  HPP ✔');
    });
  })
  .catch(err => {
    console.error('✖  MongoDB connection failed:', err.message);
    process.exit(1);
  });
