const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// POST /users - Register new user
exports.register = async (req, res, next) => {
  try {
    const { user, token } = await userService.register(req.body);
    
    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail(user.email, `${user.name.first} ${user.name.last}`)
      .catch(error => logger.error('Failed to send welcome email:', error));
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// POST /users/login - Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    
    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// GET /users - Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
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
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await userService.getUserById(userId);
    res.json(user);
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
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await userService.updateUser(userId, req.body);
    res.json(user);
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
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await userService.changeBusinessStatus(userId, isBusiness);
    
    // Send business approval email if becoming business user
    if (isBusiness) {
      emailService.sendBusinessApprovalEmail(user.email, `${user.name.first} ${user.name.last}`)
        .catch(error => logger.error('Failed to send business approval email:', error));
    }
    
    res.json({
      message: `Business status ${isBusiness ? 'activated' : 'deactivated'}`,
      user
    });
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
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const result = await userService.deleteUser(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
