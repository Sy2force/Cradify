const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    // Get token from x-auth-token header (priority) or Authorization Bearer
    let token = req.header('x-auth-token');
    
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin middleware
exports.isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Business middleware
exports.isBusiness = (req, res, next) => {
  if (!req.user.isBusiness && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Business access required' });
  }
  next();
};
