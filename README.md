### 1. Project Information
* **Project Name:** SheBuilds — A Secure Women's Business & Freelance Marketplace
* **Group Members:** 
  1. Hareem Hamid
  2. Radia Shahzad
* **Primary User Role:** Customer

---

### 2. Live Website
* **Public URL:** https://she-builds-flame.vercel.app/

---

### 3. Developed Pages
1. **Home / Landing Page (Home.jsx):** Displays system name, system mission statement, value proposition cards, call-to-action buttons, global navigation bar, and footer.
2. **Login / User Entry Page (Login.jsx):** Role selection dropdown (Customer, Seller, Admin), email input, password input with show/hide toggle, dynamic input validation, and clear security boundary notice.
3. **Core Functional Marketplace Page (Marketplace.jsx):** Interactive product & service listing cards for women entrepreneurs, live search bar, dynamic category badge filters, and inquiry trigger buttons.

---

### 4. JavaScript Interactions
1. **Show / Hide Password Toggle:** Toggle state handler switching the password input field type between password and plaintext for user clarity.
2. **Dynamic Search Bar:** Real-time text filter evaluating listing titles against user input on every keystroke.
3. **Category Filtering:** Filter handler switching state between 'All', 'Products', and 'Services' to dynamically re-render marketplace cards.
4. **Client-Side Form Validation:** Dynamic error state verifying valid email structure and minimum 6-character length before processing authentication requests.

---

### 5. Testing
* **Problem discovered:** When filtering categories on the Marketplace page while text was present in the search field, search results did not automatically reset, leading to unexpected empty screens on narrow searches.
* **Improvement made:** Updated the category selection handler state to clear the active search term string when switching category badges, ensuring consistent results.