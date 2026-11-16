// src/components/Login.jsx
// Phase 5 & 6: Real backend JWT authentication + Registration + Password Strength Meter
// Uses window.checkPasswordStrength() loaded from /public/password_strength_helper.js.

import { useState } from 'react';
import { saveSession } from '../api/client';
import { loginUser, registerUser } from '../data/store';

const LEVEL_COLOR = {
  Weak: '#e53935',
  Moderate: '#f9a825',
  Strong: '#2e7d32',
};

const s = {
  page: {
    maxWidth: '460px',
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ebdcd5',
    borderRadius: '8px',
    background: '#fff',
    fontFamily: 'inherit',
  },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' },
  tab: (active) => ({
    flex: 1,
    padding: '0.6rem',
    border: `1px solid ${active ? '#8b3d61' : '#d9c6bd'}`,
    borderRadius: '6px',
    background: active ? '#8b3d61' : '#fdf8f5',
    color: active ? '#fff' : '#2b2d42',
    fontWeight: 600,
    cursor: 'pointer',
  }),
  title: { margin: '0 0 0.4rem', color: '#8b3d61' },
  hint: { fontSize: '0.82rem', color: '#666', marginBottom: '1rem', lineHeight: 1.5 },
  label: { display: 'block', fontWeight: 600, marginBottom: '0.3rem', marginTop: '0.9rem' },
  input: {
    width: '100%',
    padding: '0.55rem',
    boxSizing: 'border-box',
    border: '1px solid #d9c6bd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  row: { display: 'flex', gap: '0.5rem' },
  toggleBtn: {
    padding: '0.5rem 0.8rem',
    border: '1px solid #d9c6bd',
    borderRadius: '4px',
    background: '#f9f4f6',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  submitBtn: {
    marginTop: '1.2rem',
    width: '100%',
    padding: '0.75rem',
    background: '#d81b60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
  },
  error: {
    color: '#c62828',
    background: '#ffebee',
    border: '1px solid #ef9a9a',
    borderRadius: '4px',
    padding: '0.6rem 0.9rem',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  meterWrap: { marginTop: '0.6rem' },
  trackWrap: { display: 'flex', gap: '4px', marginBottom: '0.4rem' },
  segment: (filled, color) => ({
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    background: filled ? color : '#e0e0e0',
    transition: 'background 0.3s',
  }),
  levelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.82rem',
    gap: '0.5rem',
  },
  levelLabel: (color) => ({ fontWeight: 700, color }),
  message: { color: '#555' },
  checklist: {
    marginTop: '0.5rem',
    padding: '0.6rem 0.8rem',
    background: '#fdf6f9',
    border: '1px solid #ebdcd5',
    borderRadius: '4px',
    listStyle: 'none',
  },
  checkItem: (ok) => ({
    fontSize: '0.8rem',
    color: ok ? '#2e7d32' : '#888',
    marginBottom: '0.2rem',
  }),
};

function segmentsFilled(score) {
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  return 3;
}

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Customer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [strength, setStrength] = useState(null);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (val === '') {
      setStrength(null);
      return;
    }

    if (typeof window.checkPasswordStrength === 'function') {
      setStrength(window.checkPasswordStrength(val));
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 3) {
        setError('Full name must be at least 3 characters.');
        return;
      }
      if (!phone.trim()) {
        setError('Contact phone number is required.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const result =
        mode === 'login'
          ? await loginUser({ email: cleanEmail, password })
          : await registerUser({
              name: name.trim(),
              email: cleanEmail,
              phone: phone.trim(),
              role,
              password,
            });

      saveSession(result.token, result.user);
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStrengthMeter = () => {
    if (!strength) return null;

    const color = LEVEL_COLOR[strength.level] || '#888';
    const filled = segmentsFilled(strength.score);
    const segments = [0, 1, 2];

    const { checks } = strength;
    const checkItems = [
      { label: 'At least 8 characters', ok: checks.atLeast8Characters },
      { label: 'At least 12 characters', ok: checks.atLeast12Characters },
      { label: 'At least 16 characters', ok: checks.atLeast16Characters },
      { label: 'Contains lowercase letter (a-z)', ok: checks.hasLowercase },
      { label: 'Contains uppercase letter (A-Z)', ok: checks.hasUppercase },
      { label: 'Contains a number (0-9)', ok: checks.hasNumber },
      { label: 'Contains a symbol (!@#$...)', ok: checks.hasSymbol },
    ];

    return (
      <div style={s.meterWrap}>
        <div style={s.trackWrap}>
          {segments.map((i) => (
            <div key={i} style={s.segment(i < filled, color)} />
          ))}
        </div>

        <div style={s.levelRow}>
          <span style={s.levelLabel(color)}>
            {strength.level === 'Weak' && '🔴 '}
            {strength.level === 'Moderate' && '🟡 '}
            {strength.level === 'Strong' && '🟢 '}
            {strength.level} ({strength.score}/{strength.maximumScore})
          </span>
          <span style={s.message}>{strength.message}</span>
        </div>

        <ul style={s.checklist}>
          {checkItems.map(({ label, ok }) => (
            <li key={label} style={s.checkItem(ok)}>
              {ok ? '✅' : '○'} {label}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.tabs}>
        <button type="button" onClick={() => switchMode('login')} style={s.tab(mode === 'login')}>
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          style={s.tab(mode === 'register')}
        >
          Create Account
        </button>
      </div>

      <h3 style={s.title}>
        {mode === 'login' ? 'SheBuilds Login' : 'Join SheBuilds'}
      </h3>

      {mode === 'login' && (
        <p style={s.hint}>
          <strong>Demo Seller:</strong> fatima@shebuilds.com | password123
          <br />
          <strong>Demo Customer:</strong> zara@shebuilds.com | password123
        </p>
      )}

      {error && <div style={s.error}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {mode === 'register' && (
          <>
            <div>
              <label style={s.label} htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={s.input}
                placeholder="e.g. Ayesha Noor"
              />
            </div>

            <div>
              <label style={s.label} htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={s.input}
                placeholder="e.g. +92 300 1234567"
              />
            </div>

            <div>
              <label style={s.label} htmlFor="role">
                Account Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={s.input}
              >
                <option value="Customer">Customer</option>
                <option value="Seller">Seller</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label style={s.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={s.input}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label style={s.label} htmlFor="password">
            Password
          </label>
          <div style={s.row}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              required
              style={{ ...s.input, flex: 1 }}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={s.toggleBtn}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {renderStrengthMeter()}
        </div>

        <button type="submit" style={s.submitBtn} disabled={submitting}>
          {submitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Login'
              : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
