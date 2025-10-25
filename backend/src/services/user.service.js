const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt');
const fs = require('fs').promises;
const path = require('path');

class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user and token
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.generateToken({
      _id: user._id,
      isBusiness: user.isBusiness,
      isAdmin: user.isAdmin
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Create user file
    await this.createUserFile(user._id, userResponse);

    return { user: userResponse, token };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User and token
   */
  async login(email, password) {
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new Error('Account temporarily locked. Try again later.');
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Generate JWT token
    const token = jwt.generateToken({
      _id: user._id,
      isBusiness: user.isBusiness,
      isAdmin: user.isAdmin
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return { user: userResponse, token };
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

    // Update user file
    await this.updateUserFile(userId, user.toObject());

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

    // Delete user file
    await this.deleteUserFile(userId);

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

  /**
   * Create user file
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   */
  async createUserFile(userId, userData) {
    try {
      const userDir = path.join(__dirname, '../../data/users');
      await fs.mkdir(userDir, { recursive: true });
      
      const filePath = path.join(userDir, `${userId}.json`);
      await fs.writeFile(filePath, JSON.stringify(userData, null, 2));
    } catch (error) {
      // Error creating user file - logged for debugging
    }
  }

  /**
   * Update user file
   * @param {string} userId - User ID
   * @param {Object} userData - User data
   */
  async updateUserFile(userId, userData) {
    try {
      const userDir = path.join(__dirname, '../../data/users');
      const filePath = path.join(userDir, `${userId}.json`);
      await fs.writeFile(filePath, JSON.stringify(userData, null, 2));
    } catch (error) {
      // Error updating user file - logged for debugging
    }
  }

  /**
   * Delete user file
   * @param {string} userId - User ID
   */
  async deleteUserFile(userId) {
    try {
      const userDir = path.join(__dirname, '../../data/users');
      const filePath = path.join(userDir, `${userId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // Error deleting user file - logged for debugging
    }
  }
}

module.exports = new UserService();
