require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = require('./src/app');
const dbService = require('./src/config/dbService');
const generateInitialData = require('./src/utils/generateInitialData');
const { initializeChat } = require('./src/sockets/chat');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 10000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize chat functionality
initializeChat(io);

// Connect to MongoDB
mongoose
  .connect(dbService.getConnectionUri(), dbService.getConnectionOptions())
  .then(async () => {
    logger.info('✅ Connected to MongoDB');
    logger.info(`📊 Database: ${dbService.getEnvironment()}`);
    
    // Generate initial data if needed
    if (process.env.INIT_DB === 'true') {
      logger.info('🌱 Seeding initial data...');
      await generateInitialData();
      logger.info('✅ Initial data seeded successfully');
    }
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}`);
      logger.info(`💬 Chat available at: http://localhost:${PORT}/chat`);
    });
  })
  .catch((error) => {
    logger.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info('\n👋 Gracefully shutting down...');
  
  try {
    // Close Socket.io connections
    io.close();
    
    // Close MongoDB connection
    await mongoose.connection.close();
    
    // Close HTTP server
    server.close(() => {
      logger.info('✅ Server closed successfully');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});
