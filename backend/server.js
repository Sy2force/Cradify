require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const dbService = require('./src/config/dbService');
const generateInitialData = require('./src/utils/generateInitialData');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 10000;
let server; // Store server instance for graceful shutdown

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
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
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
    // Close server first
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
    
    // Close MongoDB connection
    await mongoose.connection.close();
    
    logger.info('✅ Server closed successfully');
    process.exit(0);
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
