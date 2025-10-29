const express = require('express');
const morgan = require('morgan');

// Import routes
const userRoutes = require('./routes/user.routes');
const cardRoutes = require('./routes/card.routes');
const authRoutes = require('./routes/auth.routes');
const statsRoutes = require('./routes/stats.routes');
const adminRoutes = require('./routes/admin.routes');

// Import middlewares
const corsMiddleware = require('./middlewares/cors.middleware');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan logger - console (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('[:date[clf]] :method :url :status :response-time ms - :res[content-length]'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Cardify API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      cards: '/api/cards'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
