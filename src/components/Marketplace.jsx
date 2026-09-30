import React, { useState } from "react";

const listings = [
  {
    id: 1,
    title: "Handmade Organic Skincare Set",
    category: "Products",
    seller: "Amina Beauty",
    price: "$35",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    title: "Custom UI/UX Design for Startups",
    category: "Services",
    seller: "Radia Designs",
    price: "$150",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    title: "Artisanal Hand-Woven Tapestry",
    category: "Products",
    seller: "Hareem Crafts",
    price: "$60",
    image: "https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    title: "Social Media Management (1 Month)",
    category: "Services",
    seller: "Digital She Marketing",
    price: "$200",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=500&q=80"
  }
];

function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
  };

  return (
    <div className="marketplace-container">
      <h2>Explore Marketplace</h2>
      <p className="page-subtitle">
        Support products and services from verified women-owned businesses.
      </p>

      {/* Filter Controls */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search products or services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="category-buttons">
          {["All", "Products", "Services"].map((cat) => (
            <button
              key={cat}
              className={`category-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="listings-grid">
        {filteredListings.length > 0 ? (
          filteredListings.map((item) => (
            <div className="listing-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <div className="listing-info">
                <span className="badge">{item.category}</span>
                <h3>{item.title}</h3>
                <p className="seller-name">By {item.seller}</p>
                <div className="card-footer">
                  <span className="price">{item.price}</span>
                  <button className="btn primary-btn small">
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
    </div>
  );
}

export default Marketplace;