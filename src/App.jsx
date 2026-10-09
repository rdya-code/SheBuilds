import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Marketplace from './components/Marketplace';
import Dashboard from './components/Dashboard';
import ListingModule from './modules/ListingModule';
import InquiryModule from './modules/InquiryModule';
import './App.css';

function AppShell() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      <header className="navbar">
        <div className="logo">SheBuilds</div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          {currentUser ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/modules/listings">Create Listing</Link>
              <Link to="/modules/inquiries">Inquiries</Link>
              <button
                onClick={handleLogout}
                style={{
                  marginLeft: '1.8rem', background: 'none', border: 'none',
                  color: '#e53935', fontWeight: 500, cursor: 'pointer', fontSize: '1rem',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Dashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Activity 3: Module 1 — protected route */}
          <Route
            path="/modules/listings"
            element={
              currentUser ? (
                <ListingModule user={currentUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Activity 3: Module 2 — protected route */}
          <Route
            path="/modules/inquiries"
            element={
              currentUser ? (
                <InquiryModule user={currentUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>&copy; 2026 SheBuilds Project — Hareem Hamid & Radia Shahzad. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}