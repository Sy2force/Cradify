/**
 * Utility Functions Hub
 * Centralized utility functions for the Cardify backend
 */

const bcrypt = require('bcryptjs');
const { DEFAULTS, FIELD_LIMITS } = require('../constants');

/**
 * Hash password utility
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password utility
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Match result
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate pagination info
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination info
 */
const generatePagination = (page = DEFAULTS.PAGINATION.PAGE, limit = DEFAULTS.PAGINATION.LIMIT, total = 0) => {
  const currentPage = Math.max(1, parseInt(page));
  const itemsPerPage = Math.min(DEFAULTS.PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit)));
  const totalPages = Math.ceil(total / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    skip,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

/**
 * Sanitize user data for safe database operations
 * @param {Object} data - Raw data object
 * @returns {Object} Sanitized data
 */
const sanitizeObject = (data) => {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
};

/**
 * Create safe user response (remove sensitive fields)
 * @param {Object} user - User document
 * @returns {Object} Safe user object
 */
const createSafeUserResponse = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : { ...user };
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.loginAttempts;
  delete userObj.lockUntil;
  delete userObj.__v;
  
  return userObj;
};

/**
 * Create safe card response
 * @param {Object} card - Card document
 * @returns {Object} Safe card object
 */
const createSafeCardResponse = (card) => {
  if (!card) return null;
  
  const cardObj = card.toObject ? card.toObject() : { ...card };
  delete cardObj.__v;
  
  return cardObj;
};

/**
 * Generate search query for text fields
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} MongoDB search query
 */
const generateTextSearchQuery = (searchTerm, fields = ['title', 'description', 'subtitle']) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return {};
  }

  const searchRegex = new RegExp(searchTerm.trim(), 'i');
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchRegex }
    }))
  };
};

/**
 * Validate and normalize email
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if string is empty or whitespace
 * @param {string} str - String to check
 * @returns {boolean} Is empty
 */
const isEmpty = (str) => {
  return !str || typeof str !== 'string' || str.trim().length === 0;
};

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated string
 */
const truncateString = (str, length = 100) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + '...';
};

module.exports = {
  hashPassword,
  comparePassword,
  generatePagination,
  sanitizeObject,
  createSafeUserResponse,
  createSafeCardResponse,
  generateTextSearchQuery,
  normalizeEmail,
  generateRandomString,
  deepClone,
  isEmpty,
  truncateString
};
