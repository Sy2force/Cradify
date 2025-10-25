const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, updateSchema, businessStatusSchema } = require('../validators/user.validator');

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.get('/', auth, isAdmin, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, validate(updateSchema), userController.updateUser);
router.patch('/:id', auth, validate(businessStatusSchema), userController.changeBusinessStatus);
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;
