import React, { useState } from 'react';

export default function Dashboard({ user, onLogout }) {
  const [accessDeniedMsg, setAccessDeniedMsg] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  // Restricted function trigger
  const handleAddProduct = () => {
    if (user.role !== 'Seller') {
      setAccessDeniedMsg('Access Denied: Only verified Sellers can post new products/services.');
    } else {
      setAccessDeniedMsg('');
      alert('Success: Post New Item Modal Opened!');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', pb: '1rem' }}>
        <div>
          <h2>Welcome, {user.name}!</h2>
          <span style={{ padding: '0.3rem 0.8rem', background: '#e0f2f1', borderRadius: '12px', fontWeight: 'bold' }}>
            Role: {user.role}
          </span>
        </div>
        <button onClick={onLogout} style={{ padding: '0.5rem 1rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {accessDeniedMsg && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', marginTop: '1rem', borderRadius: '4px', border: '1px solid #ef9a9a' }}>
          ⚠️ <strong>Security Notice:</strong> {accessDeniedMsg}
        </div>
      )}

      {/* Seller View */}
      {user.role === 'Seller' && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Seller Studio Management</h3>
          <button onClick={handleAddProduct} style={{ padding: '0.6rem 1.2rem', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}>
            + Add New Listing
          </button>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px' }}>
            <p><strong>Your Account Phone:</strong> {user.phone}</p>
            <p><strong>Active Listings:</strong> 2 Services Live</p>
          </div>
        </div>
      )}

      {/* Customer View */}
      {user.role === 'Customer' && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Customer Portal</h3>
          <button onClick={handleAddProduct} style={{ padding: '0.6rem 1.2rem', background: '#757575', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}>
            Try Posting Listing (Restricted Function)
          </button>
          <div style={{ background: '#fff8e1', padding: '1rem', borderRadius: '6px', border: '1px solid #ffe082' }}>
            <p><strong>Seller Contact Details (Masked for Privacy):</strong></p>
            <p>{showPhone ? user.phone : '+92 300 *******'}</p>
            <button onClick={() => setShowPhone(!showPhone)}>
              {showPhone ? 'Hide Number' : 'Request Direct Contact'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}