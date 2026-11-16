// backend/routes/inquiries.js
// MODULE 2 — Inquiries & Tracking (Member 2: Hareem Hamid)
// Implements SQLite persistence, JWT authentication, role-isolated queries, and status updates.

const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const ALLOWED_STATUSES = ['New', 'In Progress', 'Completed'];

function serializeInquiry(row) {
  return {
    id: row.id,
    ref: row.ref,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    sellerId: row.seller_id,
    seller: row.seller_name,
    customerId: row.customer_id,
    customer: row.customer_name,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function generateNextRef() {
  const row = db
    .prepare("SELECT MAX(CAST(SUBSTR(ref, 5) AS INTEGER)) AS maxNum FROM inquiries WHERE ref LIKE 'INQ-%'")
    .get();
  const nextNum = Math.max((row?.maxNum || 100) + 1, 101);
  return `INQ-${nextNum}`;
}

// GET /api/inquiries — protected route; returns ONLY records belonging to the logged-in user
router.get('/', verifyToken, (req, res) => {
  const refFilter = typeof req.query.ref === 'string' ? req.query.ref.trim().toLowerCase() : '';
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';

  const isCustomer = req.user.role === 'Customer';
  const conditions = [isCustomer ? 'customer_id = ?' : 'seller_id = ?'];
  const params = [req.user.id];

  if (refFilter) {
    conditions.push('LOWER(ref) LIKE ?');
    params.push(`%${refFilter}%`);
  }

  if (statusFilter && statusFilter !== 'All') {
    if (!ALLOWED_STATUSES.includes(statusFilter)) {
      return res.status(400).json({ error: 'Invalid status filter.' });
    }
    conditions.push('status = ?');
    params.push(statusFilter);
  }

  const rows = db
    .prepare(`SELECT * FROM inquiries WHERE ${conditions.join(' AND ')} ORDER BY id DESC`)
    .all(...params);

  return res.json({ inquiries: rows.map(serializeInquiry) });
});

// POST /api/inquiries — Customer-only route to submit a validated inquiry
router.post('/', verifyToken, requireRole('Customer'), (req, res) => {
  const rawListingId = req.body?.listingId;
  const listingId =
    typeof rawListingId === 'boolean' || String(rawListingId ?? '').trim() === ''
      ? NaN
      : Number(rawListingId);
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  const fieldErrors = {};
  if (!Number.isInteger(listingId) || listingId <= 0) {
    fieldErrors.listingId = 'Please select a listing.';
  }
  if (!message) {
    fieldErrors.message = 'Message is required.';
  } else if (message.length < 10) {
    fieldErrors.message = 'Message must be at least 10 characters.';
  } else if (message.length > 300) {
    fieldErrors.message = 'Message must be 300 characters or fewer.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields and try again.',
      fieldErrors,
    });
  }

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Selected listing was not found.' });
  }

  const ref = generateNextRef();

  const result = db
    .prepare(`
      INSERT INTO inquiries
        (ref, listing_id, listing_title, seller_id, seller_name, customer_id, customer_name, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New')
    `)
    .run(
      ref,
      listing.id,
      listing.title,
      listing.seller_id,
      listing.seller_name,
      req.user.id,
      req.user.name,
      message
    );

  const created = db
    .prepare('SELECT * FROM inquiries WHERE id = ?')
    .get(Number(result.lastInsertRowid));

  return res.status(201).json({
    message: `Inquiry sent to ${listing.seller_name}. Your reference number is ${ref}.`,
    ref,
    inquiry: serializeInquiry(created),
  });
});

// PATCH /api/inquiries/:ref/status — Seller-only route with ownership verification
router.patch('/:ref/status', verifyToken, requireRole('Seller'), (req, res) => {
  const ref = typeof req.params.ref === 'string' ? req.params.ref.trim() : '';
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const inquiry = db.prepare('SELECT * FROM inquiries WHERE ref = ?').get(ref);
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }

  if (inquiry.seller_id !== req.user.id) {
    return res.status(403).json({
      error: 'Access Denied: you can only update inquiries for your own listings.',
    });
  }

  db.prepare('UPDATE inquiries SET status = ? WHERE ref = ? AND seller_id = ?').run(
    status,
    ref,
    req.user.id
  );

  const updated = db.prepare('SELECT * FROM inquiries WHERE ref = ?').get(ref);

  return res.json({
    message: `${ref} is now "${status}".`,
    inquiry: serializeInquiry(updated),
  });
});

module.exports = router;
