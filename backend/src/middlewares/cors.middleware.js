const cors = require('cors');

// Whitelist of allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token'
  ],
  exposedHeaders: ['x-auth-token'],
  maxAge: 86400 // 24 hours
};

// Development mode - allow all origins
if (process.env.NODE_ENV === 'development') {
  corsOptions.origin = true;
}

module.exports = cors(corsOptions);
