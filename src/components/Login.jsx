import React, { useState } from 'react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError('Please enter a valid email address and a password with at least 6 characters.');
      return;
    }
    setError('');
    alert(`Logged in successfully as ${role.toUpperCase()} (Demo Mode)`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to SheBuilds</h2>
        <p className="auth-subtitle">Please sign in to continue</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="seller">Seller / Entrepreneur</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn primary-btn full-width">Sign In</button>
        </form>
      </div>
    </div>
  );
}