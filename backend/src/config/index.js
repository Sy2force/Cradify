/**
 * Configuration Hub
 * Centralized configuration management for the Cardify backend
 */

const dbService = require('./dbService');
const { JWT_CONFIG, DB_CONFIG, CORS_CONFIG } = require('../constants');

class ConfigService {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 10000;
    this.jwtSecret = process.env.JWT_SECRET || 'cardify_super_secret_jwt_key_2024_exam_project_secure_token_generator_32_chars';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.dbService = dbService;
  }

  // Server Configuration
  getServerConfig() {
    return {
      port: this.port,
      env: this.env,
      frontendUrl: this.frontendUrl
    };
  }

  // JWT Configuration
  getJWTConfig() {
    return {
      secret: this.jwtSecret,
      expiresIn: JWT_CONFIG.EXPIRES_IN,
      refreshExpiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN,
      algorithm: JWT_CONFIG.ALGORITHM,
      issuer: JWT_CONFIG.ISSUER
    };
  }

  // Database Configuration
  getDatabaseConfig() {
    return {
      uri: this.dbService.getConnectionUri(),
      options: this.dbService.getConnectionOptions(),
      environment: this.dbService.getEnvironment(),
      isAtlas: this.dbService.isAtlas()
    };
  }

  // CORS Configuration
  getCORSConfig() {
    return {
      ...CORS_CONFIG,
      origin: this.env === 'development' ? true : CORS_CONFIG.ALLOWED_ORIGINS
    };
  }

  // Email Configuration
  getEmailConfig() {
    return {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      isConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    };
  }

  // Development flags
  isDevelopment() {
    return this.env === 'development';
  }

  isProduction() {
    return this.env === 'production';
  }

  isTest() {
    return this.env === 'test';
  }
}

module.exports = new ConfigService();
