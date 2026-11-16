### 1. Project Information
* **Project Name:** SheBuilds — A Secure Women's Business & Freelance Marketplace
* **Group Members:**
  1. **Hareem Hamid** (`Hareem986`) — Module 2: Inquiries & Tracking (Frontend + Backend API)
  2. **Radia Shahzad** — Module 1: Create & Manage Listings (Frontend + Backend API)
* **User Roles:** Seller, Customer

---

### 2. Live Website & Repository
* **Public URL:** https://she-builds-flame.vercel.app/
* **GitHub Repository:** https://github.com/rdya-code/SheBuilds.git

---

### 3. Tech Stack (Full-Stack — Activity 6)
* **Frontend:** React 19, React Router DOM, Vite (`src/`)
* **Backend:** Node.js, Express (`backend/`)
* **Database:** SQLite via Node.js built-in `node:sqlite` (`backend/shebuilds.db`, schema in `backend/schema.sql`)
* **Authentication & Security:** `bcryptjs` password hashing, `jsonwebtoken` (JWT Bearer tokens), RBAC middleware, parameterized SQL queries

---

### 4. How to Run Locally

#### 1. Start the Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```
On first startup, `backend/db.js` creates `backend/shebuilds.db` from `backend/schema.sql` and seeds demo accounts, listings, and inquiries.

#### 2. Start the Frontend Dev Server (Port 5173)
```bash
npm install
npm run dev
```
Vite proxies all `/api/*` requests directly to `http://localhost:5000`.

---

### 5. Pages & Modules
1. **Home (`src/components/Home.jsx`):** Mission, value proposition cards, call-to-action buttons.
2. **Login & Registration (`src/components/Login.jsx`):** Backend JWT authentication (`POST /api/auth/login`), new user registration (`POST /api/auth/register`), show/hide password toggle, and real-time password strength checker (`public/password_strength_helper.js`).
3. **Marketplace (`src/components/Marketplace.jsx`):** Fetches live listings from SQLite (`GET /api/listings`) with search, category filters, and inquiry navigation.
4. **Dashboard (`src/components/Dashboard.jsx`):** Role-specific portal displaying database-backed listings, inquiries, reports, and server-masked seller phone numbers.
5. **Module 1 — Create Listing (`src/modules/ListingModule.jsx` & `backend/routes/listings.js`, Radia Shahzad):** Seller-only creation, listing management, and deletion with client + server validation.
6. **Module 2 — Inquiries & Tracking (`src/modules/InquiryModule.jsx` & `backend/routes/inquiries.js`, Hareem Hamid):** Customer inquiry submission (generating `INQ-XXX` references), search by reference, filter by status, and Seller status updates with ownership checks.

---

### 6. Implemented Backend API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Verifies Express server and SQLite database connectivity |
| `POST` | `/api/auth/login` | Public | Verifies email & bcrypt password hash; returns signed JWT |
| `POST` | `/api/auth/register` | Public | Validates inputs, hashes password with bcrypt, creates user, returns JWT |
| `GET` | `/api/auth/me` | Authenticated (JWT) | Verifies JWT and returns current user profile |
| `GET` | `/api/auth/sellers` | Authenticated (JWT) | Returns seller directory with server-masked phone numbers |
| `GET` | `/api/listings` | Public | Lists all marketplace listings (supports `?category=` and `?search=`) |
| `GET` | `/api/listings/mine` | Seller (JWT + RBAC) | Lists only the authenticated seller's listings |
| `POST` | `/api/listings` | Seller (JWT + RBAC) | Validates and inserts a new listing into SQLite |
| `DELETE` | `/api/listings/:id` | Seller (JWT + RBAC) | Deletes own listing after ownership and inquiry reference checks |
| `GET` | `/api/inquiries` | Authenticated (JWT) | Returns role-isolated inquiries (`customer_id` or `seller_id`) |
| `POST` | `/api/inquiries` | Customer (JWT + RBAC) | Validates input, creates inquiry with `INQ-XXX` reference in SQLite |
| `PATCH` | `/api/inquiries/:ref/status` | Seller (JWT + RBAC) | Updates inquiry status after verifying seller ownership |

---

### 7. Demo Accounts (Seeded in `backend/shebuilds.db`)
| Name | Role | Email | Password |
|---|---|---|---|
| Fatima Khan | Seller | `fatima@shebuilds.com` | `password123` |
| Ayesha Noor | Seller | `ayesha@shebuilds.com` | `password123` |
| Zara Ahmed | Customer | `zara@shebuilds.com` | `password123` |

*(Passwords are stored in SQLite solely as bcrypt hashes; no plaintext passwords are kept in frontend JavaScript or browser storage.)*

---

### 8. Security Controls Implemented
* **Password Hashing:** `bcryptjs` (salt rounds: 10) for all accounts in SQLite; zero plaintext passwords in frontend code or `sessionStorage`.
* **JWT Verification:** `verifyToken` rejects missing, malformed, tampered, and expired Bearer tokens with `401 Unauthorized`.
* **Server-Side RBAC & Ownership:** `requireRole()` enforces Seller/Customer restrictions (`403 Forbidden`) and prevents sellers from altering another seller's listings or inquiries.
* **Server-Side Validation:** Trims inputs and validates field types, min/max lengths, numeric bounds, and allowed enums on every POST/PATCH endpoint.
* **SQL Injection Prevention:** Every SQLite query uses parameterized `?` placeholders via `node:sqlite` prepared statements.
* **Safe Error Handling:** Central Express error middleware catches unexpected failures without exposing stack traces or database internals, and React `ErrorBoundary` isolates UI crashes.
