import { useEffect, useState } from 'react';
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
import { ErrorBoundary } from './modules/shared';
import { clearSession, getStoredToken, getStoredUser, saveSession } from './api/client';
import { fetchCurrentUser } from './data/store';
import './App.css';

function AppShell() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [checkingSession, setCheckingSession] = useState(() => Boolean(getStoredToken()));
  const navigate = useNavigate();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return undefined;

    let active = true;
    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        saveSession(token, user);
        setCurrentUser(user);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          clearSession();
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCheckingSession(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  if (checkingSession && !currentUser) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <p>Verifying session...</p>
        </main>
      </div>
    );
  }

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
                  marginLeft: '1.8rem',
                  background: 'none',
                  border: 'none',
                  color: '#e53935',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '1rem',
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
          <Route path="/marketplace" element={<Marketplace user={currentUser} />} />
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
                <ErrorBoundary>
                  <Dashboard user={currentUser} onLogout={handleLogout} />
                </ErrorBoundary>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Module 1 — Create Listing (Radia Shahzad) */}
          <Route
            path="/modules/listings"
            element={
              currentUser ? (
                <ErrorBoundary>
                  <ListingModule user={currentUser} />
                </ErrorBoundary>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          {/* Module 2 — Inquiries & Tracking (Hareem Hamid) */}
          <Route
            path="/modules/inquiries"
            element={
              currentUser ? (
                <ErrorBoundary>
                  <InquiryModule user={currentUser} />
                </ErrorBoundary>
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
