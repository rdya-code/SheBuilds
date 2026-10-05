import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Marketplace from './components/Marketplace';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  return (
    <div>
      <Navbar onNavigate={(page) => setCurrentPage(page)} currentUser={currentUser} onLogout={handleLogout} />
      
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <>
          {currentPage === 'home' && <Home />}
          {currentPage === 'marketplace' && <Marketplace />}
          {currentPage === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
        </>
      )}

      <Footer />
    </div>
  );
}