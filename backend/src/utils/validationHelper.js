/**
 * Validation Helper Utilities
 * Centralized validation functions for the Cardify API
 */

const { REGEX_PATTERNS, ERROR_MESSAGES, FIELD_LIMITS } = require('../constants');

class ValidationHelper {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  static isValidEmail(email) {
    return REGEX_PATTERNS.EMAIL.test(email);
  }

  /**
   * Validate phone format
   * @param {string} phone - Phone to validate
   * @returns {boolean}
   */
  static isValidPhone(phone) {
    return REGEX_PATTERNS.PHONE.test(phone);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean}
   */
  static isValidPassword(password) {
    return REGEX_PATTERNS.PASSWORD.test(password) && 
           password.length >= FIELD_LIMITS.PASSWORD.MIN && 
           password.length <= FIELD_LIMITS.PASSWORD.MAX;
  }

  /**
   * Validate MongoDB ObjectId format
   * @param {string} id - ID to validate
   * @returns {boolean}
   */
  static isValidObjectId(id) {
    return REGEX_PATTERNS.OBJECT_ID.test(id);
  }

  /**
   * Validate name length
   * @param {string} name - Name to validate
   * @returns {boolean}
   */
  static isValidName(name) {
    return name && name.length >= FIELD_LIMITS.NAME.MIN && name.length <= FIELD_LIMITS.NAME.MAX;
  }

  /**
   * Validate string length
   * @param {string} str - String to validate
   * @param {number} min - Minimum length
   * @param {number} max - Maximum length
   * @returns {boolean}
   */
  static isValidLength(str, min, max) {
    return str && str.length >= min && str.length <= max;
  }

  /**
   * Sanitize string input
   * @param {string} str - String to sanitize
   * @returns {string}
   */
  static sanitizeString(str) {
    if (!str) return '';
    return str.toString().trim();
  }

  /**
   * Format phone number
   * @param {string} phone - Phone to format
   * @returns {string}
   */
  static formatPhone(phone) {
    if (!phone) return '';
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add dash if missing and length is 10
    if (digits.length === 10 && !phone.includes('-')) {
      return `${digits.slice(0, 2)  }-${  digits.slice(2)}`;
    }
    
    return phone;
  }

  /**
   * Validate and format user input data
   * @param {Object} data - User data to validate
   * @returns {Object} - Validation result
   */
  static validateUserData(data) {
    const errors = [];

    // Validate email
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID);
    }

    // Validate password
    if (!data.password || !this.isValidPassword(data.password)) {
      errors.push(ERROR_MESSAGES.VALIDATION.PASSWORD_WEAK);
    }

    // Validate name
    if (!data.name || !this.isValidName(data.name.first) || !this.isValidName(data.name.last)) {
      errors.push(ERROR_MESSAGES.VALIDATION.NAME_LENGTH);
    }

    // Validate phone
    if (!data.phone || !this.isValidPhone(data.phone)) {
      errors.push(ERROR_MESSAGES.VALIDATION.PHONE_INVALID);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate card data
   * @param {Object} data - Card data to validate
   * @returns {Object} - Validation result
   */
  static validateCardData(data) {
    const errors = [];

    // Validate title
    if (!this.isValidLength(data.title, FIELD_LIMITS.TITLE.MIN, FIELD_LIMITS.TITLE.MAX)) {
      errors.push(`Title must be between ${FIELD_LIMITS.TITLE.MIN} and ${FIELD_LIMITS.TITLE.MAX} characters`);
    }

    // Validate subtitle
    if (!this.isValidLength(data.subtitle, FIELD_LIMITS.SUBTITLE.MIN, FIELD_LIMITS.SUBTITLE.MAX)) {
      errors.push(`Subtitle must be between ${FIELD_LIMITS.SUBTITLE.MIN} and ${FIELD_LIMITS.SUBTITLE.MAX} characters`);
    }

    // Validate description
    if (!this.isValidLength(data.description, FIELD_LIMITS.DESCRIPTION.MIN, FIELD_LIMITS.DESCRIPTION.MAX)) {
      errors.push(`Description must be between ${FIELD_LIMITS.DESCRIPTION.MIN} and ${FIELD_LIMITS.DESCRIPTION.MAX} characters`);
    }

    // Validate email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID);
    }

    // Validate phone
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push(ERROR_MESSAGES.VALIDATION.PHONE_INVALID);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean and prepare user data for database
   * @param {Object} userData - Raw user data
   * @returns {Object} - Cleaned user data
   */
  static cleanUserData(userData) {
    return {
      name: {
        first: this.sanitizeString(userData.name?.first),
        middle: this.sanitizeString(userData.name?.middle) || '',
        last: this.sanitizeString(userData.name?.last)
      },
      email: this.sanitizeString(userData.email).toLowerCase(),
      password: userData.password, // Keep password as-is for validation
      phone: this.formatPhone(userData.phone),
      address: {
        country: this.sanitizeString(userData.address?.country),
        city: this.sanitizeString(userData.address?.city),
        street: this.sanitizeString(userData.address?.street),
        houseNumber: userData.address?.houseNumber || 0,
        zip: userData.address?.zip || 0,
        state: this.sanitizeString(userData.address?.state) || undefined
      },
      isBusiness: Boolean(userData.isBusiness),
      image: {
        url: this.sanitizeString(userData.image?.url) || undefined,
        alt: this.sanitizeString(userData.image?.alt) || undefined
      }
    };
  }

  /**
   * Clean and prepare card data for database
   * @param {Object} cardData - Raw card data
   * @returns {Object} - Cleaned card data
   */
  static cleanCardData(cardData) {
    return {
      title: this.sanitizeString(cardData.title),
      subtitle: this.sanitizeString(cardData.subtitle),
      description: this.sanitizeString(cardData.description),
      phone: this.formatPhone(cardData.phone),
      email: this.sanitizeString(cardData.email).toLowerCase(),
      web: this.sanitizeString(cardData.web) || undefined,
      address: {
        country: this.sanitizeString(cardData.address?.country),
        city: this.sanitizeString(cardData.address?.city),
        street: this.sanitizeString(cardData.address?.street),
        houseNumber: cardData.address?.houseNumber || 0,
        zip: cardData.address?.zip || 0,
        state: this.sanitizeString(cardData.address?.state) || undefined
      },
      image: {
        url: this.sanitizeString(cardData.image?.url) || undefined,
        alt: this.sanitizeString(cardData.image?.alt) || undefined
      }
    };
  }
}

module.exports = ValidationHelper;

// Export individual functions for backwards compatibility
module.exports.validateInput = ValidationHelper.validateUserData.bind(ValidationHelper);
module.exports.cleanUserData = ValidationHelper.cleanUserData.bind(ValidationHelper);
module.exports.handleValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation error',
    errors: Array.isArray(errors) ? errors : [errors]
  });
};
