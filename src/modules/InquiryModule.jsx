// src/modules/InquiryModule.jsx
// MODULE 2 — Inquiries & Tracking
// Covers Activity 3 Part 3: primary function, validation, JS interactions, feedback, data display.

import React, { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import {
  getListings, getInquiries, subscribe, addInquiry, updateInquiryStatus,
} from '../data/store';
import { styles, Notice } from './shared';

const STATUSES = ['New', 'In Progress', 'Completed'];

// VALIDATION RULES
export function validateInquiry(values) {
  const errors = {};

  if (!values.listingId) errors.listingId = 'Please select a listing.';

  const message = values.message.trim();
  if (!message) errors.message = 'Message is required.';
  else if (message.length < 10) errors.message = 'Message must be at least 10 characters.';
  else if (message.length > 300) errors.message = 'Message must be 300 characters or fewer.';

  return errors;
}

export default function InquiryModule({ user }) {
  const listings = useSyncExternalStore(subscribe, getListings);
  const inquiries = useSyncExternalStore(subscribe, getInquiries);

  const [form, setForm] = useState({ listingId: '', message: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isCustomer = user.role === 'Customer';
  const isSeller = user.role === 'Seller';

  // ROLE-BASED VISIBILITY (security-aware display):
  // Customers see only inquiries they sent. Sellers see only inquiries on their listings.
  const visible = inquiries.filter((q) =>
    isCustomer ? q.customer === user.name : q.seller === user.name
  );

  // SEARCH + FILTER (second JS interaction)
  const term = search.trim().toLowerCase();
  const results = visible.filter(
    (q) =>
      q.ref.toLowerCase().includes(term) &&
      (statusFilter === 'All' || q.status === statusFilter)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  // PRIMARY FUNCTION: send an inquiry
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isCustomer) {
      setNotice({ type: 'error', text: 'Access Denied: only Customers can send inquiries.' });
      return;
    }

    const found = validateInquiry(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setNotice({ type: 'error', text: 'Please fix the highlighted fields and try again.' });
      return;
    }

    const listing = listings.find((l) => String(l.id) === form.listingId);
    const ref = addInquiry({
      listingId: listing.id,
      listingTitle: listing.title,
      seller: listing.seller,
      customer: user.name,
      message: form.message.trim(),
    });

    setForm({ listingId: '', message: '' });
    setNotice({ type: 'success', text: `Inquiry sent to ${listing.seller}. Your reference number is ${ref}.` });
  };

  // SECOND JS INTERACTION: seller updates status
  const handleStatusChange = (ref, status) => {
    if (!isSeller) {
      setNotice({ type: 'error', text: 'Access Denied: only Sellers can update inquiry status.' });
      return;
    }
    updateInquiryStatus(ref, status);
    setNotice({ type: 'success', text: `${ref} is now "${status}".` });
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2>Inquiries &amp; Tracking</h2>
          <span style={styles.badge}>Role: {user.role}</span>
        </div>
        <Link to="/dashboard" style={styles.link}>← Back to Dashboard</Link>
      </div>

      <Notice notice={notice} />

      {/* CUSTOMER: send an inquiry */}
      {isCustomer && (
        <div style={styles.card}>
          <h3>Request an Inquiry</h3>
          <form onSubmit={handleSubmit} noValidate>
            <label style={styles.label} htmlFor="listingId">Listing</label>
            <select
              id="listingId" name="listingId" value={form.listingId}
              onChange={handleChange} style={styles.input}
            >
              <option value="">-- Select a listing --</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} (${l.price}) by {l.seller}
                </option>
              ))}
            </select>
            {errors.listingId && <p style={styles.fieldError}>{errors.listingId}</p>}

            <label style={styles.label} htmlFor="message">Message</label>
            <textarea
              id="message" name="message" value={form.message}
              onChange={handleChange} placeholder="Ask your question (10–300 characters)"
              style={styles.textarea}
            />
            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: '0.2rem 0 0' }}>
              {form.message.trim().length} / 300 characters
            </p>
            {errors.message && <p style={styles.fieldError}>{errors.message}</p>}

            <button type="submit" style={styles.btn}>Send Inquiry</button>
          </form>
        </div>
      )}

      {/* BOTH ROLES: search, filter, and view results */}
      <div style={styles.card}>
        <h3>{isCustomer ? 'My Inquiries' : 'Incoming Inquiries'}</h3>

        <div style={styles.row}>
          <input
            type="text"
            placeholder="Search by reference (e.g. INQ-101)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...styles.input, flex: '2 1 220px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...styles.input, flex: '1 1 150px' }}
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {visible.length === 0 ? (
          <p>{isCustomer ? 'You have not sent any inquiries yet.' : 'No inquiries on your listings yet.'}</p>
        ) : results.length === 0 ? (
          <p>No inquiries match your search or filter.</p>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              Showing {results.length} of {visible.length}
            </p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Reference</th>
                  <th style={styles.th}>Listing</th>
                  <th style={styles.th}>{isCustomer ? 'Seller' : 'Customer'}</th>
                  <th style={styles.th}>Message</th>
                  <th style={styles.th}>Status</th>
                  {isSeller && <th style={styles.th}>Update</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((q) => (
                  <tr key={q.ref}>
                    <td style={styles.td}><strong>{q.ref}</strong></td>
                    <td style={styles.td}>{q.listingTitle}</td>
                    <td style={styles.td}>{isCustomer ? q.seller : q.customer}</td>
                    <td style={styles.td}>{q.message}</td>
                    <td style={styles.td}>{q.status}</td>
                    {isSeller && (
                      <td style={styles.td}>
                        <select
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.ref, e.target.value)}
                          style={{ ...styles.input, width: 'auto' }}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}