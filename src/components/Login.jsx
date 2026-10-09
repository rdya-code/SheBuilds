import React, { useState } from 'react';
import { DEMO_USERS } from './users';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // PART 4: Functional login — identify the user from the demo list
  const handleSubmit = (e) => {
    e.preventDefault();
    const user = DEMO_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );

    if (user) {
      setError('');
      onLoginSuccess(user); // App.jsx stores the user and routes by role
    } else {
      setError('Invalid credentials! Use one of the demo accounts shown above.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>SheBuilds Login</h3>
      <p style={{ fontSize: '0.85rem', color: '#666' }}>
        <strong>Demo Seller:</strong> fatima@shebuilds.com | password123<br />
        <strong>Demo Customer:</strong> zara@shebuilds.com | password123
      </p>

      {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          style={{ width: '100%', padding: '0.7rem', background: '#d81b60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Login
        </button>
      </form>
    </div>
  );
}