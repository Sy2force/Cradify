const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import routes
const userRoutes = require('./routes/user.routes');
const cardRoutes = require('./routes/card.routes');

// Import middlewares
const corsMiddleware = require('./middlewares/cors.middleware');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Create logs and data directories if they don't exist
const logsDir = path.join(__dirname, '../logs');
const dataDir = path.join(__dirname, '../data');
const usersDir = path.join(dataDir, 'users');
const cardsDir = path.join(dataDir, 'cards');

[logsDir, dataDir, usersDir, cardsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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

// Morgan logger - file for errors (status >= 400)
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

app.use(morgan('[:date[clf]] :remote-addr :method :url :status :response-time ms - :res[content-length] ":user-agent"', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode < 400
}));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

// Chat page route
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '../chat.html'));
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Chat statistics endpoint
app.get('/api/chat/stats', (req, res) => {
  const { getChatStats } = require('./sockets/chat');
  res.json(getChatStats());
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Cardify API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      cards: '/api/cards',
      chat: '/chat',
      chatStats: '/api/chat/stats'
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
