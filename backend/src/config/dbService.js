require('dotenv').config();

class DatabaseService {
  constructor() {
    this.environment = process.env.DB_ENVIRONMENT || 'local';
    this.localUri = process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/cardify';
    this.atlasUri = process.env.MONGODB_URI_ATLAS;
    this.productionUri = process.env.MONGODB_URI; // Standard Render/Heroku env var
  }

  /**
   * Get the appropriate MongoDB URI based on environment
   * @returns {string} MongoDB connection URI
   */
  getConnectionUri() {
    // Production environment (Render/Heroku)
    if (process.env.NODE_ENV === 'production' && this.productionUri) {
      return this.productionUri;
    }
    
    // Development/testing environments
    if (this.environment === 'atlas' && this.atlasUri) {
      return this.atlasUri;
    } else if (this.localUri) {
      return this.localUri;
    } else {
      throw new Error('No valid MongoDB URI found. Please configure MONGODB_URI, MONGODB_URI_LOCAL or MONGODB_URI_ATLAS');
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
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      socketTimeoutMS: 45000
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
