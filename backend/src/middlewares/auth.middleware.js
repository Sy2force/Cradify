const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const ResponseHelper = require('../helpers/responseHelper');
const { ERROR_MESSAGES } = require('../constants');

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    // Get token from x-auth-token header (priority) or Authorization Bearer
    const token = req.header('x-auth-token');
    
    if (!token) {
      return ResponseHelper.unauthorized(res, ERROR_MESSAGES.AUTH.LOGIN_REQUIRED);
    }

    const jwtConfig = config.getJWTConfig();
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return ResponseHelper.unauthorized(res, ERROR_MESSAGES.AUTH.TOKEN_INVALID);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ResponseHelper.unauthorized(res, ERROR_MESSAGES.AUTH.TOKEN_EXPIRED);
    }
    return ResponseHelper.unauthorized(res, ERROR_MESSAGES.AUTH.TOKEN_INVALID);
  }
};

// Admin middleware
exports.isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return ResponseHelper.forbidden(res, 'Admin access required');
  }
  next();
};

// Business middleware
exports.isBusiness = (req, res, next) => {
  if (!req.user.isBusiness && !req.user.isAdmin) {
    return ResponseHelper.forbidden(res, ERROR_MESSAGES.CARD.BUSINESS_REQUIRED);
  }
  next();
};
