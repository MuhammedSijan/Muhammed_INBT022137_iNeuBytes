const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medilink_jwt_super_secret_key_2026_ineubytes_internship';

/**
 * Middleware to verify JWT token from Authorization header or cookie
 */
const verifyToken = (req, res, next) => {
  let token = null;

  // Extract from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
};

/**
 * Middleware to enforce role-based access control
 * @param {string[]} allowedRoles Array of allowed roles: ['admin', 'doctor', 'patient']
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires [${roles.join(', ')}] role. Current role: ${req.user.role}.`
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware for public endpoints that can enhance response if logged in
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth
};
