// Password hashing (Node's built-in scrypt, no native deps) + in-memory sessions.

const crypto = require('crypto');

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// token -> { username, accountNumber, expires }
const sessions = new Map();

function createSession(username, accountNumber) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, accountNumber, expires: Date.now() + SESSION_TTL_MS });
  return token;
}

function getSession(token) {
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.expires) {
    sessions.delete(token);
    return null;
  }
  s.expires = Date.now() + SESSION_TTL_MS; // sliding expiry
  return s;
}

function destroySession(token) {
  sessions.delete(token);
}

// Express middleware: expects "Authorization: Bearer <token>"
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'Not logged in or session expired' });
  req.session = session;
  req.token = token;
  next();
}

module.exports = {
  MAX_FAILED_ATTEMPTS,
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  requireAuth,
};
