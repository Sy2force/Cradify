const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');
const ResponseHelper = require('../utils/responseHelper');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');

// POST /users - Register new user
exports.register = async (req, res, next) => {
  try {
    const { user, token } = await userService.register(req.body);
    
    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail(user.email, `${user.name.first} ${user.name.last}`)
      .catch(error => logger.error('Failed to send welcome email:', error));
    
    return ResponseHelper.registerSuccess(res, user, token);
  } catch (error) {
    next(error);
  }
};

// POST /users/login - Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    
    return ResponseHelper.loginSuccess(res, user, token);
  } catch (error) {
    // Handle authentication errors with proper status codes
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// GET /users - Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return ResponseHelper.success(res, { users, count: users.length });
  } catch (error) {
    next(error);
  }
};

// GET /users/:id - Get user profile
exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check permission
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const user = await userService.getUserById(userId);
    return ResponseHelper.success(res, { user });
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id - Update user profile
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Check permission
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const user = await userService.updateUser(userId, req.body);
    return ResponseHelper.success(res, { user }, SUCCESS_MESSAGES.USER.UPDATED);
  } catch (error) {
    next(error);
  }
};

// PATCH /users/:id - Change business status
exports.changeBusinessStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { isBusiness } = req.body;
    
    // Check permission (user can change own status)
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const user = await userService.changeBusinessStatus(userId, isBusiness);
    
    // Send business approval email if becoming business user
    if (isBusiness) {
      emailService.sendBusinessApprovalEmail(user.email, `${user.name.first} ${user.name.last}`)
        .catch(error => logger.error('Failed to send business approval email:', error));
    }
    
    const message = `Business status ${isBusiness ? 'activated' : 'deactivated'}`;
    return ResponseHelper.success(res, { user }, message);
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id - Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Only admin or the user themselves can delete
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const result = await userService.deleteUser(userId);
    return ResponseHelper.success(res, result, SUCCESS_MESSAGES.USER.DELETED);
  } catch (error) {
    next(error);
  }
};
