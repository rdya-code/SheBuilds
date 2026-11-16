// src/data/store.js
// Connects frontend components to the Express/SQLite backend API.
// Replaces all previous in-memory mock arrays (Activity 6 Task 3).

import { apiRequest } from '../api/client';

export async function loginUser(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser() {
  const data = await apiRequest('/api/auth/me');
  return data.user;
}

export async function fetchMaskedSellers() {
  const data = await apiRequest('/api/auth/sellers');
  return data.sellers || [];
}

// Module 1 (Radia Shahzad): Listings API
export async function fetchListings({ category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search.trim()) params.set('search', search.trim());
  const qs = params.toString();
  const data = await apiRequest(`/api/listings${qs ? `?${qs}` : ''}`);
  return data.listings || [];
}

export async function fetchMyListings() {
  const data = await apiRequest('/api/listings/mine');
  return data.listings || [];
}

export async function createListing(payload) {
  return apiRequest('/api/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeListing(id) {
  return apiRequest(`/api/listings/${id}`, {
    method: 'DELETE',
  });
}

// Module 2 (Hareem Hamid): Inquiries & Tracking API
export async function fetchInquiries({ ref = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (ref.trim()) params.set('ref', ref.trim());
  if (status && status !== 'All') params.set('status', status);
  const qs = params.toString();
  const data = await apiRequest(`/api/inquiries${qs ? `?${qs}` : ''}`);
  return data.inquiries || [];
}

export async function createInquiry(payload) {
  return apiRequest('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateInquiryStatus(ref, status) {
  return apiRequest(`/api/inquiries/${encodeURIComponent(ref)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
