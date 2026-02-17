/**
 * ═══════════════════════════════════════════════════════
 *  Email Service  ·  OTP via Nodemailer
 * ═══════════════════════════════════════════════════════
 *  Sends 6-digit OTP emails for password reset.
 *  Falls back to console logging in development if
 *  SMTP credentials are not configured.
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Generate a cryptographically random 6-digit OTP
 */
const generateOTP = () => {
  // crypto.randomInt is secure; avoids Math.random() bias
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create reusable transporter
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If SMTP is not configured, return null (dev mode)
  if (!host || !user || !pass || user === 'your-email@gmail.com') {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,  // true for 465, false for other ports
    auth: { user, pass },
    tls: { rejectUnauthorized: true }
  });
};

/**
 * Send OTP email for password reset
 * @returns {string} The generated OTP
 */
const sendResetOTP = async (email, firstName) => {
  const otp = generateOTP();
  const transporter = createTransporter();

  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"WOW Service" <noreply@wow-service.com>',
    to: email,
    subject: 'WOW: Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; border-radius: 12px; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #FF6B35; font-size: 28px; margin: 0;">W<span style="color: #fff;">O</span>W</h1>
          <p style="color: #888; font-size: 14px;">Work On Wheels</p>
        </div>
        <h2 style="color: #fff; font-size: 20px; text-align: center;">Password Reset</h2>
        <p style="color: #ccc; font-size: 14px;">Hi <strong>${firstName}</strong>,</p>
        <p style="color: #ccc; font-size: 14px;">Use this OTP to reset your password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background: #FF6B35; color: #fff; font-size: 32px; font-weight: 800; padding: 16px 40px; border-radius: 12px; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">This OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
        <p style="color: #666; font-size: 11px; text-align: center;">© 2026 WOW (Work On Wheels). All rights reserved.</p>
      </div>
    `
  };

  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] OTP sent to ${email}`);
  } else {
    // Dev mode: log OTP to console
    console.log('═══════════════════════════════════════');
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    console.log('  (Configure SMTP in .env for real emails)');
    console.log('═══════════════════════════════════════');
  }

  return otp;
};

module.exports = { generateOTP, sendResetOTP };
