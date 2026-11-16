// backend/routes/listings.js
// MODULE 1 — Create & Manage Listings (Member 1: Radia Shahzad)
// Implements SQLite persistence, JWT authentication, Seller RBAC, and server-side validation.

const express = require('express');
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const ALLOWED_CATEGORIES = ['Products', 'Services'];

const DEFAULT_IMAGES = {
  Products: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
  Services: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=500&q=80',
};

function validateListingPayload(body) {
  const errors = {};
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const priceRaw = body?.price !== undefined && body?.price !== null ? String(body.price).trim() : '';
  const priceNum = typeof body?.price === 'boolean' || priceRaw === '' ? NaN : Number(priceRaw);

  if (!title) errors.title = 'Title is required.';
  else if (title.length < 5) errors.title = 'Title must be at least 5 characters.';
  else if (title.length > 60) errors.title = 'Title must be 60 characters or fewer.';

  if (!category) errors.category = 'Please select a category.';
  else if (!ALLOWED_CATEGORIES.includes(category)) errors.category = 'Invalid category.';

  if (!priceRaw || typeof body?.price === 'boolean') {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(priceNum) || priceNum <= 0) {
    errors.price = 'Price must be a positive number.';
  } else if (priceNum > 100000) {
    errors.price = 'Price must be 100,000 or less.';
  }

  if (!description) errors.description = 'Description is required.';
  else if (description.length < 20) errors.description = 'Description must be at least 20 characters.';
  else if (description.length > 300) errors.description = 'Description must be 300 characters or fewer.';

  return {
    errors,
    cleaned: {
      title,
      category,
      price: Math.round(priceNum * 100) / 100,
      description,
      image_url: DEFAULT_IMAGES[category] || '',
    },
  };
}

function serializeListing(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    sellerId: row.seller_id,
    seller: row.seller_name,
    createdAt: row.created_at,
  };
}

// GET /api/listings — public catalog used by Marketplace and Module 2 inquiry dropdown
router.get('/', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  const conditions = [];
  const params = [];

  if (category && category !== 'All') {
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category filter.' });
    }
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(LOWER(title) LIKE ? OR LOWER(seller_name) LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM listings ${whereClause} ORDER BY id DESC`)
    .all(...params);

  return res.json({ listings: rows.map(serializeListing) });
});

// GET /api/listings/mine — Seller-only route returning authenticated seller's own listings
router.get('/mine', verifyToken, requireRole('Seller'), (req, res) => {
  const rows = db
    .prepare('SELECT * FROM listings WHERE seller_id = ? ORDER BY id DESC')
    .all(req.user.id);

  return res.json({ listings: rows.map(serializeListing) });
});

// POST /api/listings — Seller-only route to create a validated listing in SQLite
router.post('/', verifyToken, requireRole('Seller'), (req, res) => {
  const { errors, cleaned } = validateListingPayload(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields and try again.',
      fieldErrors: errors,
    });
  }

  const result = db
    .prepare(
      'INSERT INTO listings (title, category, price, description, image_url, seller_id, seller_name) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      cleaned.title,
      cleaned.category,
      cleaned.price,
      cleaned.description,
      cleaned.image_url,
      req.user.id,
      req.user.name
    );

  const created = db
    .prepare('SELECT * FROM listings WHERE id = ?')
    .get(Number(result.lastInsertRowid));

  return res.status(201).json({
    message: 'Listing published. It now appears in the Marketplace and inquiry dropdown.',
    listing: serializeListing(created),
  });
});

// DELETE /api/listings/:id — Seller-only route with strict ownership enforcement
router.delete('/:id', verifyToken, requireRole('Seller'), (req, res) => {
  const listingId = Number(req.params.id);
  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ error: 'Invalid listing ID.' });
  }

  const existing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
  if (!existing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (existing.seller_id !== req.user.id) {
    return res.status(403).json({ error: 'Access Denied: you can only delete your own listings.' });
  }

  const linkedInquiry = db
    .prepare('SELECT id FROM inquiries WHERE listing_id = ? LIMIT 1')
    .get(listingId);

  if (linkedInquiry) {
    return res.status(409).json({
      error: 'Cannot delete a listing that already has customer inquiries.',
    });
  }

  db.prepare('DELETE FROM listings WHERE id = ? AND seller_id = ?').run(listingId, req.user.id);
  return res.json({ message: 'Listing deleted successfully.' });
});

module.exports = router;
