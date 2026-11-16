// src/components/users.js
// Role-Based Access Control (RBAC) helpers & privacy masking utilities.
// Hardcoded demo passwords have been removed from frontend code; authentication is verified
// against bcrypt password hashes on the backend (/api/auth/login).

export const ROLE_PERMISSIONS = {
  Seller: [
    'add_listing',
    'view_my_listings',
    'view_inquiries',
    'update_inquiry_status',
  ],
  Customer: [
    'browse_marketplace',
    'view_my_inquiries',
  ],
};

// Returns true only if the user's role includes the permission.
export function hasPermission(user, permission) {
  if (!user) return false;
  const allowed = ROLE_PERMISSIONS[user.role] || [];
  return allowed.includes(permission);
}

// Masks the last 7 digits of a phone number for privacy.
// "+92 300 1234567" -> "+92 300 *******"
export function maskPhone(phone) {
  if (!phone || phone.length <= 7) return '*******';
  return phone.slice(0, -7) + '*******';
}
