const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { wrap, httpError } = require('../lib/utils');
const { issueToken, clearToken, requireAuth } = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes' },
});

const credentials = (body) => ({
  email: String(body.email || '').trim().toLowerCase(),
  password: String(body.password || ''),
});

router.post(
  '/signup',
  limiter,
  wrap(async (req, res) => {
    const { email, password } = credentials(req.body);
    if (!EMAIL_RE.test(email)) throw httpError(400, 'Enter a valid email address');
    if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
    if (password !== String(req.body.confirmPassword || '')) throw httpError(400, 'Passwords do not match');
    if (await User.exists({ email })) throw httpError(409, 'An account with this email already exists');

    // Signup always creates a regular user; a role in the request body is ignored.
    const user = await User.create({
      email,
      name: email.split('@')[0],
      password: await bcrypt.hash(password, 12),
    });
    issueToken(res, user);
    res.status(201).json({ user });
  })
);

// A single login for both roles: the account's own role decides where the frontend sends it.
router.post(
  '/login',
  limiter,
  wrap(async (req, res) => {
    const { email, password } = credentials(req.body);
    const user = await User.findOne({ email }).select('+password');
    const valid = user && (await bcrypt.compare(password, user.password));
    if (!valid) throw httpError(401, 'Invalid email or password');
    issueToken(res, user);
    res.json({ user });
  })
);

// Admin signup is gated by a shared access code (set as ADMIN_SIGNUP_CODE) so it isn't open to anyone.
router.post(
  '/admin-signup',
  limiter,
  wrap(async (req, res) => {
    const { email, password } = credentials(req.body);
    if (!EMAIL_RE.test(email)) throw httpError(400, 'Enter a valid email address');
    if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
    if (password !== String(req.body.confirmPassword || '')) throw httpError(400, 'Passwords do not match');
    if (!process.env.ADMIN_SIGNUP_CODE) throw httpError(403, 'Admin signup is not enabled on this server');
    if (String(req.body.accessCode || '') !== process.env.ADMIN_SIGNUP_CODE) {
      throw httpError(403, 'Incorrect admin access code');
    }
    if (await User.exists({ email })) throw httpError(409, 'An account with this email already exists');

    const user = await User.create({
      email,
      name: email.split('@')[0],
      role: 'admin',
      password: await bcrypt.hash(password, 12),
    });
    issueToken(res, user);
    res.status(201).json({ user });
  })
);

router.post('/logout', (_req, res) => {
  clearToken(res);
  res.json({ message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

module.exports = router;
