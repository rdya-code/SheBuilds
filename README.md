### 1. Project Information
* **Project Name:** SheBuilds — A Secure Women's Business & Freelance Marketplace
* **Group Members:**
  1. Hareem Hamid
  2. Radia Shahzad
* **User Roles:** Seller, Customer

---

### 2. Live Website
* **Public URL:** https://she-builds-flame.vercel.app/

---

### 3. Developed Pages
1. **Home (Home.jsx):** System name, mission, value proposition cards, call-to-action buttons.
2. **Login (Login.jsx):** Functional demo login. Identifies the user and routes them to their role's dashboard.
3. **Marketplace (Marketplace.jsx):** Product and service listings with live search and category filters.
4. **Dashboard (Dashboard.jsx):** Role-specific interface. Sellers manage listings and inquiries. Customers track inquiries and browse.

---

### 4. Roles and Functions

**Seller (Fatima Khan)**
1. Add New Listing (restricted to Sellers)
2. View My Listings
3. View and update status of Incoming Inquiries

**Customer (Zara Ahmed)**
1. Browse Marketplace
2. Track My Inquiries
3. View masked seller contact details

---

### 5. Demo Accounts
| Name | Role | Email | Password |
|---|---|---|---|
| Fatima Khan | Seller | fatima@shebuilds.com | password123 |
| Zara Ahmed | Customer | zara@shebuilds.com | password123 |

---

### 6. Access Control and Security
* **Restricted function:** Adding a listing is permitted only for the Seller role. Customers receive an "Access Denied" notice.
* **Protected information:** The seller's phone number is shown in full only to that seller. Customers see it masked (e.g. +92 300 *******).
* **Logout:** Clears the session and returns the user to the login page. Protected routes redirect unauthenticated visitors to login.
* **Limitation:** This is a front-end prototype. Credentials are stored in client-side JavaScript and session state is held in memory, so it is not production-grade security.

---

### 7. JavaScript Interactions
1. Show / hide password toggle
2. Dynamic search and category filtering on the Marketplace
3. Client-side form validation
4. Role-based rendering of dashboards
5. Permission check on every restricted action
6. Add listing form and inquiry status updates

---

### 8. Testing
| Test | Expected Result |
|---|---|
| Seller logs in | Seller dashboard with listings, inquiries, and reports |
| Customer logs in | Customer dashboard with inquiries and masked contacts |
| Customer clicks "Post a Listing" | "Access Denied" notice, no form opens |
| Seller adds a listing | New listing appears in My Listings |
| Logout | Returns to login; /dashboard redirects to /login |

**Problem discovered:** When filtering categories on the Marketplace while text was in the search field, results did not reset, leading to unexpected empty screens.
**Improvement made:** The category handler now clears the search term when a category badge is selected.

**Problem discovered:** The Login page did not pass its result to the app, so logging in had no effect.
**Improvement made:** Login now calls `onLoginSuccess`, and the app stores the user and routes by role.