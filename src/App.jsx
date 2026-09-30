import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Marketplace from './components/Marketplace';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Navigation Bar */}
        <header className="navbar">
          <div className="logo">SheBuilds</div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/login">Login</Link>
          </nav>
        </header>

        {/* Main Connected Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>&copy; 2026 SheBuilds Project — Hareem Hamid & Radia Shahzad. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}