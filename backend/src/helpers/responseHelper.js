/**
 * Response Helper Utilities
 * Standardized response formatting for the Cardify API
 */

const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../constants');

class ResponseHelper {
  /**
   * Send successful response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    const response = {
      success: true,
      message,
      ...(data && { ...data })
    };
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {*} details - Additional error details
   */
  static error(res, message = ERROR_MESSAGES.GENERAL.INTERNAL_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    const response = {
      success: false,
      message,
      ...(details && { details })
    };
    
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {*} validationErrors - Validation error details
   */
  static validationError(res, validationErrors) {
    return this.error(res, 'Validation error', HTTP_STATUS.BAD_REQUEST, validationErrors);
  }

  /**
   * Send unauthorized error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom message
   */
  static unauthorized(res, message = ERROR_MESSAGES.AUTH.UNAUTHORIZED) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Send forbidden error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom message
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * Send not found error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom message
   */
  static notFound(res, message = ERROR_MESSAGES.GENERAL.NOT_FOUND) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send conflict error response
   * @param {Object} res - Express response object
   * @param {string} message - Custom message
   */
  static conflict(res, message = 'Conflict') {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }

  /**
   * Send login success response
   * @param {Object} res - Express response object
   * @param {Object} user - User object
   * @param {string} token - JWT token
   */
  static loginSuccess(res, user, token) {
    return this.success(res, { user, token }, SUCCESS_MESSAGES.AUTH.LOGIN, HTTP_STATUS.OK);
  }

  /**
   * Send registration success response
   * @param {Object} res - Express response object
   * @param {Object} user - User object
   * @param {string} token - JWT token
   */
  static registerSuccess(res, user, token) {
    return this.success(res, { user, token }, SUCCESS_MESSAGES.AUTH.REGISTER, HTTP_STATUS.CREATED);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of data
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = 'Success') {
    return this.success(res, { data, pagination }, message, HTTP_STATUS.OK);
  }

  /**
   * Send created resource response
   * @param {Object} res - Express response object
   * @param {*} data - Created resource data
   * @param {string} message - Success message
   */
  static created(res, data, message = 'Created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send deleted resource response
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   */
  static deleted(res, message = 'Deleted successfully') {
    return this.success(res, null, message, HTTP_STATUS.OK);
  }
}

module.exports = ResponseHelper;
