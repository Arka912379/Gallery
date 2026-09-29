const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { wrap, httpError } = require('../lib/utils');

const COOKIE = 'pg_token';
const baseCookie = () => ({
  httpOnly: true, // not readable from JavaScript, so XSS can't steal the session
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
});

function issueToken(res, user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE, token, { ...baseCookie(), maxAge: 7 * 24 * 60 * 60 * 1000 });
}

const clearToken = (res) => res.clearCookie(COOKIE, baseCookie());

// Loads the user from the database on every request, so role changes and deletions apply immediately.
const requireAuth = wrap(async (req, _res, next) => {
  const token = req.cookies[COOKIE];
  if (!token) throw httpError(401, 'Please log in to continue');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Your session has expired. Please log in again');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw httpError(401, 'Account no longer exists');
  req.user = user;
  next();
});

const requireAdmin = (req, _res, next) =>
  req.user.role === 'admin' ? next() : next(httpError(403, 'Administrator access required'));

module.exports = { issueToken, clearToken, requireAuth, requireAdmin };
