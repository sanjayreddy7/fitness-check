const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const db = require('../database/db');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // If no header, return 401 Unauthorized
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// Optional Auth: if token provided, sets req.user; otherwise continues with demo fallback
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = db.getUserById('user-demo-1');
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(decoded.id);
    req.user = user || db.getUserById('user-demo-1');
  } catch (err) {
    req.user = db.getUserById('user-demo-1');
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuth
};
