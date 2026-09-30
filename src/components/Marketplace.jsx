import React, { useState } from 'react';

const SAMPLE_LISTINGS = [
  { id: 1, title: 'Handmade Organic Skincare Set', category: 'Products', seller: 'Amina Beauty', price: '$35', image: 'https://via.placeholder.com/200?text=Skincare' },
  { id: 2, title: 'Custom UI/UX Design for Startups', category: 'Services', seller: 'Radia Designs', price: '$150', image: 'https://via.placeholder.com/200?text=UI+Design' },
  { id: 3, title: 'Artisanal Hand-Woven Tapestry', category: 'Products', seller: 'Hareem Crafts', price: '$60', image: 'https://via.placeholder.com/200?text=Tapestry' },
  { id: 4, title: 'Social Media Management (1 Month)', category: 'Services', seller: 'Digital She Marketing', price: '$200', image: 'https://via.placeholder.com/200?text=Marketing' },
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredListings = SAMPLE_LISTINGS.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      <h2>SheBuilds Marketplace</h2>
      <p className="page-subtitle">Discover and support products and services from verified women creators.</p>

      {/* Task 2 Interactions: Search & Category Filtering */}
      <div className="filter-controls">
        <input 
          type="text" 
          placeholder="Search products or services..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="category-buttons">
          {['All', 'Products', 'Services'].map((cat) => (
            <button 
              key={cat} 
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listing Grid */}
      <div className="listings-grid">
        {filteredListings.length > 0 ? (
          filteredListings.map((item) => (
            <div key={item.id} className="listing-card">
              <img src={item.image} alt={item.title} />
              <div className="listing-info">
                <span className="badge">{item.category}</span>
                <h3>{item.title}</h3>
                <p className="seller-name">By {item.seller}</p>
                <div className="card-footer">
                  <span className="price">{item.price}</span>
                  <button className="btn primary-btn small">Inquire / Request</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No listings match your search criteria.</p>
        )}
      </div>
    </div>
  );
}