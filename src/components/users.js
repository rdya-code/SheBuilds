// src/components/users.js

// Demo users (no database needed for Activity 2)
export const DEMO_USERS = [
  {
    id: 1,
    email: "fatima@shebuilds.com",
    password: "password123",
    role: "Seller",
    name: "Fatima Khan",
    phone: "+92 300 1234567",
  },
  {
    id: 2,
    email: "zara@shebuilds.com",
    password: "password123",
    role: "Customer",
    name: "Zara Ahmed",
    phone: "+92 321 9876543",
  },
];

// ROLE-BASED ACCESS CONTROL (Part 7)
// Single source of truth: which functions each role is allowed to perform.
export const ROLE_PERMISSIONS = {
  Seller: [
    "add_listing",            // Restricted function (Part 7)
    "view_my_listings",
    "view_inquiries",         // Seller sees inquiries sent to them
    "update_inquiry_status",
  ],
  Customer: [
    "browse_marketplace",
    "view_my_inquiries",      // Customer tracks their own inquiries
  ],
};

// Returns true only if the user's role includes the permission.
export function hasPermission(user, permission) {
  if (!user) return false;
  const allowed = ROLE_PERMISSIONS[user.role] || [];
  return allowed.includes(permission);
}

// SECURITY-AWARE DATA DISPLAY (Part 8)
// Keeps the country code and operator prefix, masks the last 7 digits.
// "+92 300 1234567" -> "+92 300 *******"
export function maskPhone(phone) {
  return phone.slice(0, -7) + "*******";
}