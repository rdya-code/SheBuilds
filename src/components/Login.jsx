// src/components/Login.jsx
// Phase 5: Added real-time password strength meter using window.checkPasswordStrength()
// (loaded via public/password_strength_helper.js)

import React, { useState } from 'react';
import { DEMO_USERS } from './users';

// ── Strength level → colour mapping ──────────────────────────────────────────
const LEVEL_COLOR = {
  Weak:     '#e53935', // red
  Moderate: '#f9a825', // amber
  Strong:   '#2e7d32', // green
};

// ── Inline styles ─────────────────────────────────────────────────────────────
const s = {
  page:   { maxWidth: '440px', margin: '2rem auto', padding: '2rem', border: '1px solid #ebdcd5', borderRadius: '8px', fontFamily: 'inherit' },
  title:  { margin: '0 0 0.3rem', color: '#8b3d61' },
  hint:   { fontSize: '0.82rem', color: '#666', marginBottom: '1.2rem', lineHeight: 1.5 },
  label:  { display: 'block', fontWeight: 600, marginBottom: '0.3rem', marginTop: '0.9rem' },
  input:  { width: '100%', padding: '0.5rem', boxSizing: 'border-box', border: '1px solid #d9c6bd', borderRadius: '4px', fontSize: '1rem' },
  row:    { display: 'flex', gap: '0.5rem' },
  toggleBtn: { padding: '0.5rem 0.8rem', border: '1px solid #d9c6bd', borderRadius: '4px', background: '#f9f4f6', cursor: 'pointer', whiteSpace: 'nowrap' },
  submitBtn: { marginTop: '1.2rem', width: '100%', padding: '0.7rem', background: '#d81b60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 },
  error:  { color: '#c62828', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '4px', padding: '0.6rem 0.9rem', fontSize: '0.9rem', marginTop: '0.5rem' },

  // Strength meter
  meterWrap:  { marginTop: '0.6rem' },
  trackWrap:  { display: 'flex', gap: '4px', marginBottom: '0.4rem' },
  segment: (filled, color) => ({
    flex: 1, height: '6px', borderRadius: '3px',
    background: filled ? color : '#e0e0e0',
    transition: 'background 0.3s',
  }),
  levelRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' },
  levelLabel: (color) => ({ fontWeight: 700, color }),
  message:    { color: '#555' },
  checklist:  { marginTop: '0.5rem', padding: '0.6rem 0.8rem', background: '#fdf6f9', border: '1px solid #ebdcd5', borderRadius: '4px', listStyle: 'none', paddingLeft: '0' },
  checkItem:  (ok) => ({ fontSize: '0.8rem', color: ok ? '#2e7d32' : '#888', marginBottom: '0.2rem' }),
};

// ── Helper: segments to fill for each level ───────────────────────────────────
// score 0-6, maximumScore 6; we show 3 visual segments (Weak / Moderate / Strong)
function segmentsFilled(score) {
  // 0-2 → 1 segment, 3-4 → 2 segments, 5-6 → 3 segments
  if (score <= 2) return 1;
  if (score <= 4) return 2;
  return 3;
}

export default function Login({ onLoginSuccess }) {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [strength,     setStrength]     = useState(null); // result of checkPasswordStrength

  // ── Phase 5: update strength whenever password changes ──────────────────────
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (val === '') {
      setStrength(null);
      return;
    }

    // window.checkPasswordStrength is loaded from /public/password_strength_helper.js
    if (typeof window.checkPasswordStrength === 'function') {
      setStrength(window.checkPasswordStrength(val));
    }
  };

  // ── Login submit ─────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const user = DEMO_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (user) {
      setError('');
      onLoginSuccess(user);
    } else {
      setError('Invalid credentials! Use one of the demo accounts shown above.');
    }
  };

  // ── Render strength meter ────────────────────────────────────────────────────
  const renderStrengthMeter = () => {
    if (!strength) return null;

    const color    = LEVEL_COLOR[strength.level] || '#888';
    const filled   = segmentsFilled(strength.score);
    const segments = [0, 1, 2]; // 3 visual bars

    const { checks } = strength;
    const checkItems = [
      { label: 'At least 8 characters',               ok: checks.atLeast8Characters },
      { label: 'At least 12 characters',              ok: checks.atLeast12Characters },
      { label: 'At least 16 characters',              ok: checks.atLeast16Characters },
      { label: 'Contains lowercase letter (a–z)',     ok: checks.hasLowercase },
      { label: 'Contains uppercase letter (A–Z)',     ok: checks.hasUppercase },
      { label: 'Contains a number (0–9)',              ok: checks.hasNumber },
      { label: 'Contains a symbol (!@#$…)',            ok: checks.hasSymbol },
    ];

    return (
      <div style={s.meterWrap}>
        {/* 3-segment colour bar */}
        <div style={s.trackWrap}>
          {segments.map((i) => (
            <div key={i} style={s.segment(i < filled, color)} />
          ))}
        </div>

        {/* Level label + hint message */}
        <div style={s.levelRow}>
          <span style={s.levelLabel(color)}>
            {strength.level === 'Weak'     && '🔴 '}
            {strength.level === 'Moderate' && '🟡 '}
            {strength.level === 'Strong'   && '🟢 '}
            {strength.level}
          </span>
          <span style={s.message}>{strength.message}</span>
        </div>

        {/* Requirement checklist */}
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
      <h3 style={s.title}>SheBuilds Login</h3>
      <p style={s.hint}>
        <strong>Demo Seller:</strong> fatima@shebuilds.com | password123<br />
        <strong>Demo Customer:</strong> zara@shebuilds.com | password123
      </p>

      {error && <div style={s.error}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div>
          <label style={s.label} htmlFor="email">Email</label>
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

        {/* Password + show/hide toggle */}
        <div>
          <label style={s.label} htmlFor="password">Password</label>
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

          {/* ── Phase 5: Password Strength Meter ── */}
          {renderStrengthMeter()}
        </div>

        <button type="submit" style={s.submitBtn}>
          Login
        </button>
      </form>
    </div>
  );
}
