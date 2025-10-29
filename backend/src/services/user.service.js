const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');
const { ERROR_MESSAGES } = require('../constants');
const { validateInput, cleanUserData } = require('../utils/validationHelper');

class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user and token
   */
  async register(userData) {
    // Clean and validate user data
    const cleanedData = cleanUserData(userData);
    const validation = validateInput(cleanedData);
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanedData.email });
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.AUTH.EMAIL_EXISTS);
    }

    // Create new user
    const user = new User(cleanedData);
    await user.save();

    // Generate JWT token
    const jwtConfig = config.getJWTConfig();
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        isBusiness: user.isBusiness,
        isAdmin: user.isAdmin
      },
      jwtConfig.secret,
      { 
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer 
      }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    return { user: userResponse, token };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User and token
   */
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        const error = new Error(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        error.statusCode = 400;
        throw error;
      }

      // Check if account is locked
      if (user.isLocked()) {
        const error = new Error(ERROR_MESSAGES.USER.ACCOUNT_LOCKED);
        error.statusCode = 400;
        throw error;
      }

      // Validate password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        try {
          await user.incLoginAttempts();
        } catch (updateError) {
          // Log warning but don't fail the login process
        }
        // Create a proper validation error instead of generic error
        const error = new Error(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
        error.statusCode = 400;
        throw error;
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        try {
          await user.resetLoginAttempts();
        } catch (updateError) {
          // Log but don't fail the login
        }
      }

      // Generate JWT token
      const jwtUtils = require('../utils/jwt');
      const token = jwtUtils.generateToken({
        _id: user._id,
        email: user.email,
        isBusiness: user.isBusiness,
        isAdmin: user.isAdmin
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    } catch (error) {
      // Re-throw with proper status if not already set
      if (!error.status) {
        error.status = 500;
      }
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @returns {Array} All users
   */
  async getAllUsers() {
    const users = await User.find({}, '-password -loginAttempts -lockUntil');
    return users;
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Object} User data
   */
  async getUserById(userId) {
    const user = await User.findById(userId, '-password -loginAttempts -lockUntil');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUser(userId, updateData) {
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.isAdmin;
    delete updateData.loginAttempts;
    delete updateData.lockUntil;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil');

    if (!user) {
      throw new Error('User not found');
    }

    // User updated successfully in database

    return user;
  }

  /**
   * Delete user (admin only)
   * @param {string} userId - User ID
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // User deleted successfully from database

    return { message: 'User deleted successfully' };
  }

  /**
   * Change user business status
   * @param {string} userId - User ID
   * @param {boolean} isBusiness - Business status
   * @returns {Object} Updated user
   */
  async changeBusinessStatus(userId, isBusiness) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isBusiness },
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

}

module.exports = new UserService();
