require('dotenv').config();

class DatabaseService {
  constructor() {
    this.environment = process.env.DB_ENVIRONMENT || 'local';
    this.localUri = process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/cardify';
    this.atlasUri = process.env.MONGODB_URI_ATLAS;
  }

  /**
   * Get the appropriate MongoDB URI based on environment
   * @returns {string} MongoDB connection URI
   */
  getConnectionUri() {
    if (this.environment === 'atlas' && this.atlasUri) {
      // Using MongoDB Atlas connection
      return this.atlasUri;
    } else {
      // Using local MongoDB connection
      return this.localUri;
    }
  }

  /**
   * Get database configuration options
   * @returns {object} Mongoose connection options
   */
  getConnectionOptions() {
    const options = {
      serverSelectionTimeoutMS: 5000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };
    return options;
  }

  /**
   * Check if using Atlas connection
   * @returns {boolean}
   */
  isAtlas() {
    return this.environment === 'atlas';
  }

  /**
   * Get current environment
   * @returns {string}
   */
  getEnvironment() {
    return this.environment;
  }
}

module.exports = new DatabaseService();
