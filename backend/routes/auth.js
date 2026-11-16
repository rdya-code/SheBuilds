// backend/routes/auth.js
// Task 4 & 5: Authentication (Login, Register, Session Verify, Masked Seller Directory).

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const JWT_EXPIRES_IN = '8h';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+\d][\d\s-]{6,19}$/;

function maskPhone(phone) {
  if (!phone || phone.length <= 7) return '*******';
  return phone.slice(0, -7) + '*******';
}

function buildPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
  };
}

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/login — verify credentials against bcrypt hash and return signed JWT
router.post('/login', (req, res) => {
  const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!emailRaw || !EMAIL_REGEX.test(emailRaw)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const user = db
    .prepare('SELECT id, name, email, password_hash, role, phone FROM users WHERE email = ?')
    .get(emailRaw);

  // Generic error avoids leaking whether the email exists
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = issueToken(user);
  return res.json({
    message: 'Login successful.',
    token,
    user: buildPublicUser(user),
  });
});

// POST /api/auth/register — create a new Seller or Customer with bcrypt-hashed password
router.post('/register', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
  const role = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({ error: 'Full name must be between 3 and 50 characters.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!PHONE_REGEX.test(phone)) {
    return res.status(400).json({ error: 'Please provide a valid phone number (e.g. +92 300 1234567).' });
  }
  if (!['Seller', 'Customer'].includes(role)) {
    return res.status(400).json({ error: 'Role must be Seller or Customer.' });
  }
  if (password.length < 8 || password.length > 100) {
    return res.status(400).json({ error: 'Password must be between 8 and 100 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, passwordHash, role, phone);

  const created = db
    .prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?')
    .get(Number(result.lastInsertRowid));

  const token = issueToken(created);
  return res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: buildPublicUser(created),
  });
});

// GET /api/auth/me — verify token and return fresh profile (no password hash)
router.get('/me', verifyToken, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?')
    .get(req.user.id);

  if (!user) {
    return res.status(401).json({ error: 'User session is no longer valid.' });
  }

  return res.json({ user: buildPublicUser(user) });
});

// GET /api/auth/sellers — returns seller directory with server-masked phones for privacy
router.get('/sellers', verifyToken, (req, res) => {
  const sellers = db
    .prepare("SELECT id, name, phone FROM users WHERE role = 'Seller' ORDER BY id ASC")
    .all()
    .map((s) => ({
      id: s.id,
      name: s.name,
      maskedPhone: maskPhone(s.phone),
    }));

  return res.json({ sellers });
});

module.exports = router;
