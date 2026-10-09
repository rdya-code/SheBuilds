### 1. Project Information
* **Project Name:** SheBuilds — A Secure Women's Business & Freelance Marketplace
* **Group Members:**
  1. Hareem Hamid (Module 2 — Inquiries & Tracking)
  2. Radia Shahzad (Module 1 — Create Listing)
* **User Roles:** Seller, Customer

---

### 2. Live Website
* **Public URL:** https://she-builds-flame.vercel.app/

---

### 3. Pages
1. **Home (Home.jsx):** Mission, value proposition cards, call-to-action buttons.
2. **Login (Login.jsx):** Functional demo login. Identifies the user and routes them to the dashboard.
3. **Marketplace (Marketplace.jsx):** Listings with live search and category filters.
4. **Dashboard (Dashboard.jsx):** Role-specific interface with links to both modules.
5. **Create Listing (modules/ListingModule.jsx):** Module 1, Seller only.
6. **Inquiries & Tracking (modules/InquiryModule.jsx):** Module 2, role-based.

---

### 4. Module 1 — Create Listing (Member: Radia Shahzad)
**Primary function:** A seller publishes a product or service listing.
**Validation rules:**
* Title: required, 5–60 characters
* Category: required (Products or Services)
* Price: required, positive number, maximum 100,000
* Description: required, 20–300 characters

**JavaScript interactions:** Live validation with field-level error messages, character counter, and a listing table that updates on publish.
**Feedback:** Green success message on publish, red error message when validation fails.
**Access control:** Customers receive "Access Denied."

---

### 5. Module 2 — Inquiries & Tracking (Member: Hareem Hamid)
**Primary function:** A customer sends an inquiry on a listing, and both sides track its status.
**Validation rules:**
* Listing: must be selected
* Message: required, 10–300 characters

**JavaScript interactions:** Search by reference number, filter by status, seller status updates.
**Data visibility:** Customers see only their own inquiries. Sellers see only inquiries on their listings.
**Feedback:** Success message showing the new reference number, error messages for invalid input, and Access Denied for the wrong role.

---

### 6. Integration
* Both modules share sample data through `src/data/store.js`. A listing published in Module 1 appears in the Module 2 dropdown.
* Both modules are protected routes. Logged-out users are redirected to Login.
* Navigation is available in the top bar and from the Dashboard.
* Shared styles are in `src/modules/shared.js`, so both modules look consistent.

---

### 7. Demo Accounts
| Name | Role | Email | Password |
|---|---|---|---|
| Fatima Khan | Seller | fatima@shebuilds.com | password123 |
| Zara Ahmed | Customer | zara@shebuilds.com | password123 |

---

### 8. Security-Aware Development
| Module | Possible Misuse | Response |
|---|---|---|
| Module 1 | Incomplete or invalid listing data (empty title, negative price) | Frontend validation blocks submission and shows field-level errors |
| Module 1 | Customer attempts to publish a listing | Role check shows Access Denied and hides the form |
| Module 2 | Customer reads another customer's inquiries | Results are filtered by role before display |
| Module 2 | Seller changes status of another seller's inquiry | Seller sees only their own inquiries, so the control is unavailable for others |

**Limitation:** All checks run in the browser. A user could bypass them by editing the code. Real enforcement needs a backend, which is planned for later in the semester. Data is in memory and resets on refresh.

---

### 9. Testing
| Test | Expected Result |
|---|---|
| Module 1: valid listing | Success message, listing appears in table |
| Module 1: empty fields | Field errors shown, nothing added |
| Module 1: price "abc" or "-5" | "Price must be a positive number." |
| Module 1: customer opens page | Access Denied |
| Module 2: valid inquiry | Success with reference number, appears in My Inquiries |
| Module 2: message under 10 characters | "Message must be at least 10 characters." |
| Module 2: search "INQ-101" | Only INQ-101 shown |
| Module 2: seller changes status | Status updates, success message shown |
| Integration: seller publishes a listing, customer selects it | New listing appears in the Module 2 dropdown |
| Logout | Protected module routes redirect to Login |

**Issue discovered (Module 1):** ____________________
**Correction made:** ____________________
**Issue discovered (Module 2):** ____________________
**Correction made:** ____________________