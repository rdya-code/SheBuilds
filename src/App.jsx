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
import './App.css';

// Inner component lives inside <Router> so it can use useNavigate.
function AppShell() {
  const [currentUser, setCurrentUser] = useState(null); // session state
  const navigate = useNavigate();

  // PART 4: store the identified user, then route to their dashboard
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    navigate('/dashboard');
  };

  // PART 9: clear session and return to login
  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Navigation Bar */}
      <header className="navbar">
        <div className="logo">SheBuilds</div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          {currentUser ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
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

      {/* Main Content with protected routes */}
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
          {/* Protected route: only logged-in users reach the dashboard */}
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
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