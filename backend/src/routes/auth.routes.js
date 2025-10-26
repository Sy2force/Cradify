const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/user.validator');

// Public authentication routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.post('/logout', auth, (req, res) => {
  // JWT is stateless, so we just return success
  // Client should remove token from storage
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

router.get('/me', auth, (req, res) => {
  // Return current user info
  res.json({
    success: true,
    user: req.user
  });
});

router.post('/refresh', auth, (req, res) => {
  // Generate new token with same payload
  const jwt = require('../utils/jwt');
  const token = jwt.generateToken({
    _id: req.user._id,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
    isBusiness: req.user.isBusiness
  });
  
  res.json({
    success: true,
    message: 'Token refreshed',
    token
  });
});

module.exports = router;
