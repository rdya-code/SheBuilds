// backend/server.js
// SheBuilds Express Backend Server (Development Activity 6)

const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const inquiryRoutes = require('./routes/inquiries');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

// Basic HTTP security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Reject malformed JSON cleanly without exposing internal stack traces
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }
  return next(err);
});

// Health endpoint verifying database connectivity
app.get('/api/health', (req, res) => {
  try {
    db.prepare('SELECT 1 AS ok').get();
    return res.json({ status: 'ok', database: 'connected' });
  } catch {
    return res.status(500).json({ status: 'error', database: 'unavailable' });
  }
});

// API Modules
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/inquiries', inquiryRoutes);

// 404 fallback for unknown API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Global error handler — hides stack traces and sensitive technical details (Task 5)
app.use((err, req, res, _next) => {
  console.error('Unhandled backend error:', err.message);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SheBuilds backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
