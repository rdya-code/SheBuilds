// backend/middleware/auth.js
// Tasks 4 & 5: JWT Authentication & Role-Based Access Control (RBAC) middleware.

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'shebuilds-jwt-secret-key-2026';

/**
 * Verifies the Bearer JWT from the Authorization header.
 * Rejects missing, malformed, tampered, or expired tokens with HTTP 401.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Authentication token is missing.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token. Access denied.' });
  }
}

/**
 * Enforces role-based permissions after verifyToken.
 * Rejects unauthorized roles with HTTP 403.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: only ${allowedRoles.join(' or ')} accounts can perform this action.`,
      });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole, JWT_SECRET };
