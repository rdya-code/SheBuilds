// src/modules/shared.jsx
// Shared styles, Notice banner, and ErrorBoundary (Activity 4 Part 6).

import React from 'react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
export const styles = {
  page: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '2px solid #ebdcd5',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #ebdcd5',
    borderRadius: '8px',
    padding: '1.2rem',
    marginBottom: '1.5rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    background: '#f8e1ea',
    color: '#8b3d61',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  label: { display: 'block', fontWeight: 600, marginBottom: '0.3rem', marginTop: '0.8rem' },
  input: {
    width: '100%',
    padding: '0.5rem',
    boxSizing: 'border-box',
    border: '1px solid #d9c6bd',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    boxSizing: 'border-box',
    minHeight: '90px',
    border: '1px solid #d9c6bd',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '1rem',
    resize: 'vertical',
  },
  btn: {
    padding: '0.55rem 1rem',
    background: '#8b3d61',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    marginTop: '0.8rem',
  },
  btnMuted: {
    padding: '0.55rem 1rem',
    background: '#757575',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    marginTop: '0.8rem',
  },
  btnDanger: {
    padding: '0.35rem 0.7rem',
    background: '#e53935',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  link: { color: '#8b3d61', fontWeight: 600, textDecoration: 'none' },
  fieldError: { color: '#c62828', fontSize: '0.85rem', margin: '0.25rem 0 0' },
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
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ebdcd5' },
  td: { textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  row: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
};

// Shows a success or error message. Renders nothing when notice is null.
export function Notice({ notice }) {
  if (!notice) return null;
  const style = notice.type === 'error' ? styles.error : styles.success;
  return (
    <div style={style}>
      {notice.type === 'error' ? '⚠️ ' : '✅ '}
      {notice.text}
    </div>
  );
}

// Isolates component render failures so a crash in one feature does not blank the whole site.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Component boundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.error}>
            <strong>This feature is temporarily unavailable.</strong> The rest of SheBuilds still works.
          </div>
          <Link to="/dashboard" style={styles.link}>← Back to Dashboard</Link>
        </div>
      );
    }
    return this.props.children;
  }
}
