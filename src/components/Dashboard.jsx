import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_USERS, hasPermission, maskPhone } from './users';

// ---------- Demo data (no database needed) ----------
const INITIAL_LISTINGS = [
  { id: 1, title: 'Handmade Organic Skincare Set', price: '$35', seller: 'Fatima Khan' },
  { id: 2, title: 'Custom UI/UX Design for Startups', price: '$150', seller: 'Fatima Khan' },
];

const INITIAL_INQUIRIES = [
  { id: 101, item: 'Handmade Organic Skincare Set', seller: 'Fatima Khan', customer: 'Zara Ahmed', status: 'New' },
  { id: 102, item: 'Custom UI/UX Design for Startups', seller: 'Fatima Khan', customer: 'Zara Ahmed', status: 'In Progress' },
  { id: 103, item: 'Social Media Management (1 Month)', seller: 'Fatima Khan', customer: 'Zara Ahmed', status: 'Completed' },
];

const NEXT_STATUS = {
  New: 'In Progress',
  'In Progress': 'Completed',
  Completed: 'Completed',
};

// ---------- Inline styles ----------
const styles = {
  page: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '2px solid #ebdcd5', paddingBottom: '1rem', marginBottom: '1.5rem',
  },
  badge: {
    padding: '0.3rem 0.8rem', background: '#f8e1ea', color: '#8b3d61',
    borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem',
  },
  card: { background: '#fff', border: '1px solid #ebdcd5', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' },
  btn: {
    padding: '0.55rem 1rem', background: '#8b3d61', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem', marginBottom: '0.5rem',
  },
  btnMuted: {
    padding: '0.55rem 1rem', background: '#757575', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem', marginBottom: '0.5rem',
  },
  logout: {
    padding: '0.5rem 1rem', background: '#e53935', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer',
  },
  error: {
    background: '#ffebee', color: '#c62828', padding: '0.8rem 1rem',
    borderRadius: '4px', border: '1px solid #ef9a9a', marginBottom: '1rem',
  },
  success: {
    background: '#e8f5e9', color: '#2e7d32', padding: '0.8rem 1rem',
    borderRadius: '4px', border: '1px solid #a5d6a7', marginBottom: '1rem',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  cell: { textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee' },
  input: { padding: '0.5rem', width: '100%', marginBottom: '0.6rem', boxSizing: 'border-box' },
};

export default function Dashboard({ user, onLogout }) {
  const [notice, setNotice] = useState(null); // { type: 'error' | 'success', text }
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // PART 7: Central permission check. Every restricted action goes through here.
  const requirePermission = (permission, action) => {
    if (!hasPermission(user, permission)) {
      setNotice({
        type: 'error',
        text: `Access Denied: the ${user.role} role is not allowed to perform this action.`,
      });
      return;
    }
    setNotice(null);
    action();
  };

  // ----- Seller functions -----
  const openAddListing = () =>
    requirePermission('add_listing', () => setShowForm(true));

  const submitListing = (e) => {
    e.preventDefault();
    requirePermission('add_listing', () => {
      if (!newTitle.trim() || !newPrice.trim()) {
        setNotice({ type: 'error', text: 'Title and price are required.' });
        return;
      }
      setListings([
        ...listings,
        { id: Date.now(), title: newTitle.trim(), price: newPrice.trim(), seller: user.name },
      ]);
      setNewTitle('');
      setNewPrice('');
      setShowForm(false);
      setNotice({ type: 'success', text: 'Listing added successfully.' });
    });
  };

  const advanceStatus = (id) =>
    requirePermission('update_inquiry_status', () => {
      setInquiries(
        inquiries.map((q) => (q.id === id ? { ...q, status: NEXT_STATUS[q.status] } : q))
      );
      setNotice({ type: 'success', text: 'Inquiry status updated.' });
    });

  // ----- Role-based views -----
  const isSeller = hasPermission(user, 'view_inquiries');
  const myListings = listings.filter((l) => l.seller === user.name);
  const incoming = inquiries.filter((q) => q.seller === user.name);
  const myInquiries = inquiries.filter((q) => q.customer === user.name);
  const sellerContacts = DEMO_USERS.filter((u) => u.role === 'Seller');

  return (
    <div style={styles.page}>
      {/* Header + Logout (PART 9) */}
      <div style={styles.header}>
        <div>
          <h2>Welcome, {user.name}!</h2>
          <span style={styles.badge}>Role: {user.role}</span>
        </div>
        <button onClick={onLogout} style={styles.logout}>Logout</button>
      </div>

      {/* Activity 3: Module navigation */}
      <div style={styles.card}>
        <h3>Modules</h3>
        <Link to="/modules/listings">
          <button style={styles.btn}>Create Listing (Module 1)</button>
        </Link>
        <Link to="/modules/inquiries">
          <button style={styles.btn}>Inquiries &amp; Tracking (Module 2)</button>
        </Link>
      </div>
      {notice && (
        <div style={notice.type === 'error' ? styles.error : styles.success}>
          {notice.type === 'error' ? '⚠️ Security Notice: ' : '✅ '}
          {notice.text}
        </div>
      )}

      {isSeller ? (
        <>
          {/* Seller account info: full phone is shown ONLY to the owner */}
          <div style={styles.card}>
            <h3>Seller Account</h3>
            <p><strong>Your Account Phone:</strong> {user.phone}</p>
          </div>

          {/* My Listings + restricted Add function (PART 5 & 7) */}
          <div style={styles.card}>
            <h3>My Listings</h3>
            <button onClick={openAddListing} style={styles.btn}>+ Add New Listing</button>

            {showForm && (
              <form onSubmit={submitListing} style={{ marginTop: '1rem' }}>
                <input
                  style={styles.input}
                  placeholder="Listing title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Price (e.g. $50)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <button type="submit" style={styles.btn}>Save Listing</button>
                <button type="button" onClick={() => setShowForm(false)} style={styles.btnMuted}>
                  Cancel
                </button>
              </form>
            )}

            <table style={{ ...styles.table, marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th style={styles.cell}>Title</th>
                  <th style={styles.cell}>Price</th>
                </tr>
              </thead>
              <tbody>
                {myListings.map((l) => (
                  <tr key={l.id}>
                    <td style={styles.cell}>{l.title}</td>
                    <td style={styles.cell}>{l.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Incoming inquiries + status update */}
          <div style={styles.card}>
            <h3>Incoming Inquiries</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.cell}>Item</th>
                  <th style={styles.cell}>Customer</th>
                  <th style={styles.cell}>Status</th>
                  <th style={styles.cell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {incoming.map((q) => (
                  <tr key={q.id}>
                    <td style={styles.cell}>{q.item}</td>
                    <td style={styles.cell}>{q.customer}</td>
                    <td style={styles.cell}>{q.status}</td>
                    <td style={styles.cell}>
                      <button
                        onClick={() => advanceStatus(q.id)}
                        disabled={q.status === 'Completed'}
                        style={styles.btn}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seller reports */}
          <div style={styles.card}>
            <h3>Seller Reports</h3>
            <p>Total listings: {myListings.length}</p>
            <p>Total inquiries: {incoming.length}</p>
            <p>Completed inquiries: {incoming.filter((q) => q.status === 'Completed').length}</p>
          </div>
        </>
      ) : (
        <>
          {/* Customer: browse */}
          <div style={styles.card}>
            <h3>Customer Portal</h3>
            <Link to="/marketplace">
              <button style={styles.btn}>Browse Marketplace</button>
            </Link>
            {/* Restricted function attempted by the wrong role (PART 7) */}
            <button onClick={openAddListing} style={styles.btnMuted}>
              Post a Listing (Seller only)
            </button>
          </div>

          {/* Customer: track own inquiries */}
          <div style={styles.card}>
            <h3>My Inquiries</h3>
            {myInquiries.length === 0 ? (
              <p>You have no inquiries yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.cell}>Item</th>
                    <th style={styles.cell}>Seller</th>
                    <th style={styles.cell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myInquiries.map((q) => (
                    <tr key={q.id}>
                      <td style={styles.cell}>{q.item}</td>
                      <td style={styles.cell}>{q.seller}</td>
                      <td style={styles.cell}>{q.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Protected info: seller phone masked for customers (PART 8) */}
          <div style={{ ...styles.card, background: '#fff8e1', border: '1px solid #ffe082' }}>
            <h3>Seller Contact Details (Masked for Privacy)</h3>
            {sellerContacts.map((s) => (
              <p key={s.id}>
                <strong>{s.name}:</strong> {maskPhone(s.phone)}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}