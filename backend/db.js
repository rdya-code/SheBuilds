// backend/db.js
// Initializes SQLite database using Node.js built-in node:sqlite (DatabaseSync),
// creates tables from schema, and seeds initial demo users, listings, and inquiries.
// All queries use parameterized statements (?) to prevent SQL injection.

const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'shebuilds.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const db = new DatabaseSync(DB_PATH);

// Single-file journal mode keeps shebuilds.db self-contained for easy backup/submission
db.exec('PRAGMA journal_mode = DELETE;');
db.exec('PRAGMA foreign_keys = ON;');

// Execute DDL schema
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schemaSql);

// Seed demo data once when the database is fresh
function seedIfEmpty() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM users').get();
  if (total > 0) return;

  const hash = (plain) => bcrypt.hashSync(plain, 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
  );

  // Passwords are stored ONLY as bcrypt hashes, never plaintext
  const fatimaRes = insertUser.run(
    'Fatima Khan',
    'fatima@shebuilds.com',
    hash('password123'),
    'Seller',
    '+92 300 1234567'
  );
  const ayeshaRes = insertUser.run(
    'Ayesha Noor',
    'ayesha@shebuilds.com',
    hash('password123'),
    'Seller',
    '+92 333 7654321'
  );
  const zaraRes = insertUser.run(
    'Zara Ahmed',
    'zara@shebuilds.com',
    hash('password123'),
    'Customer',
    '+92 321 9876543'
  );

  const fatimaId = Number(fatimaRes.lastInsertRowid);
  const ayeshaId = Number(ayeshaRes.lastInsertRowid);
  const zaraId = Number(zaraRes.lastInsertRowid);

  // Seed Module 1 Listings (Radia Shahzad)
  const insertListing = db.prepare(
    'INSERT INTO listings (title, category, price, description, image_url, seller_id, seller_name) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const l1 = insertListing.run(
    'Handmade Organic Skincare Set',
    'Products',
    35,
    'Set of handmade organic skincare products made in small batches.',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
    fatimaId,
    'Fatima Khan'
  );
  const l2 = insertListing.run(
    'Custom UI/UX Design for Startups',
    'Services',
    150,
    'Custom interface and experience design for early-stage startups.',
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=500&q=80',
    fatimaId,
    'Fatima Khan'
  );
  insertListing.run(
    'Artisanal Hand-Woven Tapestry',
    'Products',
    60,
    'Intricately hand-woven wall tapestry crafted from natural cotton fibers.',
    'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=500&q=80',
    ayeshaId,
    'Ayesha Noor'
  );
  insertListing.run(
    'Social Media Management (1 Month)',
    'Services',
    200,
    'Full-month content calendar, reels strategy, and engagement reporting.',
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=500&q=80',
    ayeshaId,
    'Ayesha Noor'
  );

  const l1Id = Number(l1.lastInsertRowid);
  const l2Id = Number(l2.lastInsertRowid);

  // Seed Module 2 Inquiries (Hareem Hamid)
  const insertInquiry = db.prepare(`
    INSERT INTO inquiries
      (ref, listing_id, listing_title, seller_id, seller_name, customer_id, customer_name, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInquiry.run(
    'INQ-101',
    l1Id,
    'Handmade Organic Skincare Set',
    fatimaId,
    'Fatima Khan',
    zaraId,
    'Zara Ahmed',
    'Do you deliver nationwide?',
    'New'
  );
  insertInquiry.run(
    'INQ-102',
    l2Id,
    'Custom UI/UX Design for Startups',
    fatimaId,
    'Fatima Khan',
    zaraId,
    'Zara Ahmed',
    'Can we discuss a three-page landing site?',
    'In Progress'
  );
  insertInquiry.run(
    'INQ-103',
    l2Id,
    'Custom UI/UX Design for Startups',
    fatimaId,
    'Fatima Khan',
    zaraId,
    'Zara Ahmed',
    'Thank you for the completed design revisions.',
    'Completed'
  );

  console.log('Seeded SQLite database with demo users, listings, and inquiries.');
}

seedIfEmpty();

module.exports = db;
