import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchListings } from '../data/store';

const FALLBACK_IMAGES = {
  Products: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80',
  Services: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=500&q=80',
};

function Marketplace({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchListings()
      .then((rows) => {
        if (active) setListings(rows);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load marketplace listings.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleInquireClick = (listingId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/modules/inquiries?listingId=${listingId}`);
  };

  return (
    <div className="marketplace-container">
      <h2>Explore Marketplace</h2>
      <p className="page-subtitle">
        Support products and services from verified women-owned businesses.
      </p>

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
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {loading ? (
        <p>Loading marketplace listings from database...</p>
      ) : (
        <div className="listings-grid">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <div className="listing-card" key={item.id}>
                <img
                  src={item.imageUrl || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.Products}
                  alt={item.title}
                />
                <div className="listing-info">
                  <span className="badge">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p className="seller-name">By {item.seller}</p>
                  <div className="card-footer">
                    <span className="price">${item.price}</span>
                    <button
                      type="button"
                      className="btn primary-btn small"
                      onClick={() => handleInquireClick(item.id)}
                    >
                      Inquire / Request
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No listings match your search criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Marketplace;
