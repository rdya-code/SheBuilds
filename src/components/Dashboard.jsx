import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hasPermission } from './users';
import {
  fetchInquiries,
  fetchMaskedSellers,
  fetchMyListings,
} from '../data/store';

const styles = {
  page: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ebdcd5',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  badge: {
    padding: '0.3rem 0.8rem',
    background: '#f8e1ea',
    color: '#8b3d61',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #ebdcd5',
    borderRadius: '8px',
    padding: '1.2rem',
    marginBottom: '1.5rem',
  },
  btn: {
    padding: '0.55rem 1rem',
    background: '#8b3d61',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
  },
  btnMuted: {
    padding: '0.55rem 1rem',
    background: '#757575',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
  },
  logout: {
    padding: '0.5rem 1rem',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '0.8rem 1rem',
    borderRadius: '4px',
    border: '1px solid #ef9a9a',
    marginBottom: '1rem',
  },
  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.8rem 1rem',
    borderRadius: '4px',
    border: '1px solid #a5d6a7',
    marginBottom: '1rem',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  cell: { textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee' },
};

export default function Dashboard({ user, onLogout }) {
  const [notice, setNotice] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSeller = hasPermission(user, 'view_inquiries');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const tasks = [fetchInquiries()];
        if (isSeller) {
          tasks.push(fetchMyListings());
        } else {
          tasks.push(fetchMaskedSellers());
        }

        const [inqRows, secondResult] = await Promise.all(tasks);
        if (!active) return;

        setInquiries(inqRows);
        if (isSeller) {
          setMyListings(secondResult);
        } else {
          setSellers(secondResult);
        }
      } catch (err) {
        if (active) {
          setNotice({ type: 'error', text: err.message || 'Failed to load dashboard data.' });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [isSeller]);

  // Central RBAC check for restricted action demo
  const testSellerAction = () => {
    if (!hasPermission(user, 'add_listing')) {
      setNotice({
        type: 'error',
        text: `Access Denied: the ${user.role} role is not allowed to perform this action.`,
      });
      return;
    }
    setNotice(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2>Welcome, {user.name}!</h2>
          <span style={styles.badge}>Role: {user.role}</span>
        </div>
        <button onClick={onLogout} style={styles.logout}>
          Logout
        </button>
      </div>

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

      {loading ? (
        <p>Loading your portal data from the database...</p>
      ) : isSeller ? (
        <>
          <div style={styles.card}>
            <h3>Seller Account</h3>
            <p>
              <strong>Your Account Phone:</strong> {user.phone}
            </p>
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>My Listings ({myListings.length})</h3>
              <Link to="/modules/listings">
                <button style={styles.btn}>+ Manage in Module 1</button>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <p>You have no listings yet.</p>
            ) : (
              <table style={{ ...styles.table, marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th style={styles.cell}>Title</th>
                    <th style={styles.cell}>Category</th>
                    <th style={styles.cell}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {myListings.map((l) => (
                    <tr key={l.id}>
                      <td style={styles.cell}>{l.title}</td>
                      <td style={styles.cell}>{l.category}</td>
                      <td style={styles.cell}>${l.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Incoming Inquiries ({inquiries.length})</h3>
              <Link to="/modules/inquiries">
                <button style={styles.btn}>Update Status in Module 2</button>
              </Link>
            </div>

            {inquiries.length === 0 ? (
              <p>No incoming inquiries yet.</p>
            ) : (
              <table style={{ ...styles.table, marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th style={styles.cell}>Ref</th>
                    <th style={styles.cell}>Item</th>
                    <th style={styles.cell}>Customer</th>
                    <th style={styles.cell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((q) => (
                    <tr key={q.ref}>
                      <td style={styles.cell}><strong>{q.ref}</strong></td>
                      <td style={styles.cell}>{q.listingTitle}</td>
                      <td style={styles.cell}>{q.customer}</td>
                      <td style={styles.cell}>{q.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={styles.card}>
            <h3>Seller Reports</h3>
            <p>Total listings: {myListings.length}</p>
            <p>Total inquiries: {inquiries.length}</p>
            <p>Completed inquiries: {inquiries.filter((q) => q.status === 'Completed').length}</p>
          </div>
        </>
      ) : (
        <>
          <div style={styles.card}>
            <h3>Customer Portal</h3>
            <Link to="/marketplace">
              <button style={styles.btn}>Browse Marketplace</button>
            </Link>
            <button onClick={testSellerAction} style={styles.btnMuted}>
              Post a Listing (Seller only)
            </button>
          </div>

          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>My Inquiries ({inquiries.length})</h3>
              <Link to="/modules/inquiries">
                <button style={styles.btn}>+ New Inquiry (Module 2)</button>
              </Link>
            </div>

            {inquiries.length === 0 ? (
              <p>You have no inquiries yet.</p>
            ) : (
              <table style={{ ...styles.table, marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th style={styles.cell}>Ref</th>
                    <th style={styles.cell}>Item</th>
                    <th style={styles.cell}>Seller</th>
                    <th style={styles.cell}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((q) => (
                    <tr key={q.ref}>
                      <td style={styles.cell}><strong>{q.ref}</strong></td>
                      <td style={styles.cell}>{q.listingTitle}</td>
                      <td style={styles.cell}>{q.seller}</td>
                      <td style={styles.cell}>{q.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ ...styles.card, background: '#fff8e1', border: '1px solid #ffe082' }}>
            <h3>Seller Contact Details (Masked for Privacy)</h3>
            {sellers.map((s) => (
              <p key={s.id}>
                <strong>{s.name}:</strong> {s.maskedPhone}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
