const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Protects routes by verifying JWT in the Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    let message = 'Invalid authentication token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Authentication token has expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Malformed or invalid authentication token.';
    }

    return res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = { protect };

