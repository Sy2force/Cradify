const cors = require('cors');
const config = require('../config');

// Get CORS configuration from centralized config
const corsConfig = config.getCORSConfig();

// CORS configuration
const corsOptions = {
  origin (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (config.isDevelopment()) {
      return callback(null, true);
    }
    
    if (corsConfig.origin === true || corsConfig.ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: corsConfig.METHODS,
  allowedHeaders: corsConfig.ALLOWED_HEADERS,
  exposedHeaders: corsConfig.EXPOSED_HEADERS,
  maxAge: corsConfig.MAX_AGE
};

module.exports = cors(corsOptions);
