-- SheBuilds Database Schema (SQLite)
-- Development Activity 6 — Task 1: Database Connectivity & Tables

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('Seller', 'Customer')),
  phone         TEXT    NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  category    TEXT    NOT NULL CHECK (category IN ('Products', 'Services')),
  price       REAL    NOT NULL CHECK (price > 0 AND price <= 100000),
  description TEXT    NOT NULL,
  image_url   TEXT    DEFAULT '',
  seller_id   INTEGER NOT NULL REFERENCES users(id),
  seller_name TEXT    NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ref           TEXT    UNIQUE NOT NULL,
  listing_id    INTEGER NOT NULL REFERENCES listings(id),
  listing_title TEXT    NOT NULL,
  seller_id     INTEGER NOT NULL REFERENCES users(id),
  seller_name   TEXT    NOT NULL,
  customer_id   INTEGER NOT NULL REFERENCES users(id),
  customer_name TEXT    NOT NULL,
  message       TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'New'
                CHECK (status IN ('New', 'In Progress', 'Completed')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
