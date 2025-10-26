/**
 * Application Constants
 * Centralized constants for the Cardify backend
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Default Values
const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100
  },
  IMAGE: {
    URL: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png',
    ALT: 'User profile picture'
  },
  ZIP_CODE: 0,
  LOGIN_ATTEMPTS: 0,
  BUSINESS_STATUS: false,
  ADMIN_STATUS: false
};

// Validation Patterns
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^0[2-9]-?\d{7,8}$/,
  PASSWORD: /^.{7,}$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/
};

// Field Limits
const FIELD_LIMITS = {
  NAME: { MIN: 2, MAX: 256 },
  EMAIL: { MAX: 320 },
  PASSWORD: { MIN: 7, MAX: 128 },
  TITLE: { MIN: 2, MAX: 256 },
  SUBTITLE: { MIN: 2, MAX: 256 },
  DESCRIPTION: { MIN: 2, MAX: 1024 },
  URL: { MAX: 2048 },
  ALT_TEXT: { MAX: 256 }
};

// Error Messages
const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please provide a valid email address',
    PASSWORD_WEAK: 'Password must be at least 7 characters long',
    PHONE_INVALID: 'Phone must be in format 0X-XXXXXXX',
    NAME_LENGTH: `Name must be between ${FIELD_LIMITS.NAME.MIN} and ${FIELD_LIMITS.NAME.MAX} characters`,
    PASSWORD_LENGTH: `Password must be between ${FIELD_LIMITS.PASSWORD.MIN} and ${FIELD_LIMITS.PASSWORD.MAX} characters`
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',
    UNAUTHORIZED: 'Access denied',
    LOGIN_REQUIRED: 'Please login to continue'
  },
  USER: {
    NOT_FOUND: 'User not found',
    ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts'
  },
  CARD: {
    NOT_FOUND: 'Card not found',
    NOT_OWNER: 'You can only modify your own cards',
    BUSINESS_REQUIRED: 'Business account required to create cards'
  },
  GENERAL: {
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    INVALID_ID: 'Invalid ID format'
  }
};

// Success Messages
const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    REGISTER: 'User created successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully'
  },
  USER: {
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    BUSINESS_STATUS_CHANGED: 'Business status updated successfully'
  },
  CARD: {
    CREATED: 'Card created successfully',
    UPDATED: 'Card updated successfully',
    DELETED: 'Card deleted successfully',
    LIKED: 'Card liked successfully',
    UNLIKED: 'Card unliked successfully'
  }
};

// JWT Configuration
const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
  ALGORITHM: 'HS256',
  ISSUER: 'cardify-api'
};

// Database Configuration
const DB_CONFIG = {
  CONNECTION_TIMEOUT: 5000,
  SOCKET_TIMEOUT: 45000,
  MAX_POOL_SIZE: 10,
  MIN_POOL_SIZE: 5,
  MAX_IDLE_TIME: 30000,
  RETRY_WRITES: true,
  W_MAJORITY: 'majority'
};

// CORS Configuration
const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ],
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token'
  ],
  EXPOSED_HEADERS: ['x-auth-token'],
  MAX_AGE: 86400 // 24 hours
};

module.exports = {
  HTTP_STATUS,
  DEFAULTS,
  REGEX_PATTERNS,
  FIELD_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  JWT_CONFIG,
  DB_CONFIG,
  CORS_CONFIG
};
