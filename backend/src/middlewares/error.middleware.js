const logger = require('../utils/logger');

// Error logger to file
const logErrorToFile = (error, req) => {
  const logEntry = {
    method: req.method,
    url: req.url,
    status: error.status || 500,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id
  };
  
  logger.error('HTTP Error', logEntry);
};

// Error handler middleware
module.exports = (err, req, res, next) => {
  // Log errors with status >= 400
  if (err.status >= 400 || !err.status) {
    logErrorToFile(err, req);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }
  
  // Cast error (invalid MongoDB ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  // Default error
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
