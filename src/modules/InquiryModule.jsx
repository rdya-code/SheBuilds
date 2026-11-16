// src/modules/InquiryModule.jsx
// MODULE 2 — Inquiries & Tracking (Member: Hareem Hamid)
// Connected to Express/SQLite backend (/api/inquiries and /api/listings).

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  createInquiry,
  fetchInquiries,
  fetchListings,
  updateInquiryStatus,
} from '../data/store';
import { styles, Notice } from './shared';

const STATUSES = ['New', 'In Progress', 'Completed'];

// eslint-disable-next-line react-refresh/only-export-components
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
  const [searchParams] = useSearchParams();
  const preselectedListingId = searchParams.get('listingId') || '';

  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ listingId: preselectedListingId, message: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isCustomer = user.role === 'Customer';
  const isSeller = user.role === 'Seller';

  useEffect(() => {
    let active = true;

    async function loadModuleData() {
      try {
        const tasks = [fetchInquiries()];
        if (isCustomer) {
          tasks.push(fetchListings());
        }

        const [inqRows, listingRows] = await Promise.all(tasks);
        if (!active) return;

        setInquiries(inqRows);
        if (isCustomer && listingRows) {
          setListings(listingRows);
        }
      } catch (err) {
        if (active) {
          setNotice({ type: 'error', text: err.message || 'Could not load inquiries.' });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadModuleData();
    return () => {
      active = false;
    };
  }, [isCustomer]);

  const term = search.trim().toLowerCase();
  const results = inquiries.filter(
    (q) =>
      q.ref.toLowerCase().includes(term) &&
      (statusFilter === 'All' || q.status === statusFilter)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
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

    setSubmitting(true);
    try {
      const result = await createInquiry({
        listingId: Number(form.listingId),
        message: form.message.trim(),
      });

      setInquiries((prev) => [result.inquiry, ...prev]);
      setForm({ listingId: '', message: '' });
      setNotice({ type: 'success', text: result.message });
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      }
      setNotice({ type: 'error', text: err.message || 'Could not send inquiry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ref, status) => {
    if (!isSeller) {
      setNotice({ type: 'error', text: 'Access Denied: only Sellers can update inquiry status.' });
      return;
    }

    try {
      const result = await updateInquiryStatus(ref, status);
      setInquiries((prev) =>
        prev.map((item) => (item.ref === ref ? result.inquiry : item))
      );
      setNotice({ type: 'success', text: result.message });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Could not update inquiry status.' });
    }
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

      {isCustomer && (
        <div style={styles.card}>
          <h3>Request an Inquiry</h3>
          <form onSubmit={handleSubmit} noValidate>
            <label style={styles.label} htmlFor="listingId">Listing</label>
            <select
              id="listingId"
              name="listingId"
              value={form.listingId}
              onChange={handleChange}
              style={styles.input}
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
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Ask your question (10–300 characters)"
              style={styles.textarea}
            />
            <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: '0.2rem 0 0' }}>
              {form.message.trim().length} / 300 characters
            </p>
            {errors.message && <p style={styles.fieldError}>{errors.message}</p>}

            <button type="submit" style={styles.btn} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </form>
        </div>
      )}

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

        {loading ? (
          <p>Loading inquiries from database...</p>
        ) : inquiries.length === 0 ? (
          <p>{isCustomer ? 'You have not sent any inquiries yet.' : 'No inquiries on your listings yet.'}</p>
        ) : results.length === 0 ? (
          <p>No inquiries match your search or filter.</p>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              Showing {results.length} of {inquiries.length}
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
