import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero">
        <h1>SheBuilds</h1>
        <h2>A Secure Women's Business & Freelance Marketplace</h2>
        <p>
          Empowering women entrepreneurs, freelancers, and home-based businesses to showcase 
          their products and services, reach customers, and manage requests safely.
        </p>
        <div className="hero-buttons">
          <Link to="/marketplace" className="btn primary-btn">Explore Marketplace</Link>
          <Link to="/login" className="btn secondary-btn">Sign In / Join</Link>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="features">
        <h3>Platform Highlights</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <h4>Verified Business Profiles</h4>
            <p>Promote your business with trust. Request verification badges to build client confidence.</p>
          </div>
          <div className="feature-card">
            <h4>Privacy Protection</h4>
            <p>Your contact details and private inquiry communications are kept strictly confidential.</p>
          </div>
          <div className="feature-card">
            <h4>Direct Service Requests</h4>
            <p>Easily browse product listings, make inquiries, and track order status securely.</p>
          </div>
        </div>
      </section>
    </div>
  );
}