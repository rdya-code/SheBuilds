// src/modules/ListingModule.jsx
// MODULE 1 — Create Listing (Member: Radia Shahzad)
// Connected to Express/SQLite backend (/api/listings).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createListing, fetchMyListings, removeListing } from '../data/store';
import { styles, Notice } from './shared';

const CATEGORIES = ['Products', 'Services'];

// eslint-disable-next-line react-refresh/only-export-components
export function validateListing(values) {
  const errors = {};

  const title = values.title.trim();
  if (!title) errors.title = 'Title is required.';
  else if (title.length < 5) errors.title = 'Title must be at least 5 characters.';
  else if (title.length > 60) errors.title = 'Title must be 60 characters or fewer.';

  if (!values.category) errors.category = 'Please select a category.';
  else if (!CATEGORIES.includes(values.category)) errors.category = 'Invalid category.';

  const priceText = values.price.trim();
  const price = Number(priceText);
  if (!priceText) errors.price = 'Price is required.';
  else if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be a positive number.';
  else if (price > 100000) errors.price = 'Price must be 100,000 or less.';

  const description = values.description.trim();
  if (!description) errors.description = 'Description is required.';
  else if (description.length < 20) errors.description = 'Description must be at least 20 characters.';
  else if (description.length > 300) errors.description = 'Description must be 300 characters or fewer.';

  return errors;
}

export default function ListingModule({ user }) {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(user.role === 'Seller');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', price: '', description: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (user.role !== 'Seller') return undefined;

    let active = true;
    fetchMyListings()
      .then((rows) => {
        if (active) setMyListings(rows);
      })
      .catch((err) => {
        if (active) {
          setNotice({ type: 'error', text: err.message || 'Could not load your listings.' });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user.role]);

  if (user.role !== 'Seller') {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h2>Create Listing</h2>
          <Link to="/dashboard" style={styles.link}>← Back to Dashboard</Link>
        </div>
        <Notice notice={{ type: 'error', text: 'Access Denied: only Sellers can create listings.' }} />
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateListing(form);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setNotice({ type: 'error', text: 'Please fix the highlighted fields and try again.' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createListing({
        title: form.title.trim(),
        category: form.category,
        price: Number(form.price),
        description: form.description.trim(),
      });

      setMyListings((prev) => [result.listing, ...prev]);
      setForm({ title: '', category: '', price: '', description: '' });
      setNotice({ type: 'success', text: result.message });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      }
      setNotice({ type: 'error', text: err.message || 'Could not publish listing.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await removeListing(id);
      setMyListings((prev) => prev.filter((item) => item.id !== id));
      setNotice({ type: 'success', text: result.message });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Could not delete listing.' });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2>Create Listing</h2>
          <span style={styles.badge}>Role: {user.role}</span>
        </div>
        <Link to="/dashboard" style={styles.link}>← Back to Dashboard</Link>
      </div>

      <Notice notice={notice} />

      <div style={styles.card}>
        <h3>New Product or Service</h3>
        <form onSubmit={handleSubmit} noValidate>
          <label style={styles.label} htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Handmade Tote Bag"
            style={styles.input}
          />
          {errors.title && <p style={styles.fieldError}>{errors.title}</p>}

          <label style={styles.label} htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">-- Select a category --</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p style={styles.fieldError}>{errors.category}</p>}

          <label style={styles.label} htmlFor="price">Price (USD)</label>
          <input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 45"
            style={styles.input}
          />
          {errors.price && <p style={styles.fieldError}>{errors.price}</p>}

          <label style={styles.label} htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what you offer (20–300 characters)"
            style={styles.textarea}
          />
          <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: '0.2rem 0 0' }}>
            {form.description.trim().length} / 300 characters
          </p>
          {errors.description && <p style={styles.fieldError}>{errors.description}</p>}

          <button type="submit" style={styles.btn} disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Your Listings ({myListings.length})</h3>
        {loading ? (
          <p>Loading listings from database...</p>
        ) : myListings.length === 0 ? (
          <p>You have no listings yet. Publish one above.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myListings.map((l) => (
                <tr key={l.id}>
                  <td style={styles.td}>{l.title}</td>
                  <td style={styles.td}>{l.category}</td>
                  <td style={styles.td}>${l.price}</td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      style={styles.btnDanger}
                      onClick={() => handleDelete(l.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
