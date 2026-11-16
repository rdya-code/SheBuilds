// src/api/client.js
// Central HTTP & session helper connecting the React frontend to the Express/SQLite backend.
// Passwords are NEVER stored in sessionStorage or localStorage (Activity 5 Task 4 & Activity 6 Task 4).

const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'shebuilds_token';
const USER_KEY = 'shebuilds_user';

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  // Store only safe profile fields and signed JWT — never passwords
  const safeUser = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    : null;

  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (safeUser) sessionStorage.setItem(USER_KEY, JSON.stringify(safeUser));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.clear();
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Cannot connect to the SheBuilds backend server. Make sure the backend is running on port 5000.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Backend server is unreachable. Start the backend server (`npm start` in backend/) and try again.');
  }

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status}).`);
    err.status = response.status;
    err.fieldErrors = data.fieldErrors || {};
    throw err;
  }

  return data;
}
