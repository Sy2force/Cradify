const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');
const ResponseHelper = require('../utils/responseHelper');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res, next) => {
  try {
    const { user, token } = await userService.register(req.body);
    
    // Envoi de l'email de bienvenue en arrière-plan
    emailService.sendWelcomeEmail(user.email, `${user.name.first} ${user.name.last}`)
      .catch(error => logger.error('Failed to send welcome email:', error));
    
    return ResponseHelper.registerSuccess(res, user, token);
  } catch (error) {
    next(error);
  }
};

// Connexion utilisateur
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    
    return ResponseHelper.loginSuccess(res, user, token);
  } catch (error) {
    // Gestion des erreurs d'authentification avec codes de statut appropriés
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// Récupération de tous les utilisateurs (admin uniquement)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return ResponseHelper.success(res, { users, count: users.length });
  } catch (error) {
    next(error);
  }
};

// Récupération du profil utilisateur
exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Vérification des permissions
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const user = await userService.getUserById(userId);
    return ResponseHelper.success(res, { user });
  } catch (error) {
    next(error);
  }
};

// Mise à jour du profil utilisateur
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Vérification des permissions
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const user = await userService.updateUser(userId, req.body);
    return ResponseHelper.success(res, { user }, SUCCESS_MESSAGES.USER.UPDATED);
  } catch (error) {
    next(error);
  }
};

// Changement du statut business
exports.changeBusinessStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { isBusiness } = req.body;
    
    // Vérification des permissions (l'utilisateur peut changer son propre statut)
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const user = await userService.changeBusinessStatus(userId, isBusiness);
    
    // Envoi de l'email d'approbation business si l'utilisateur devient business
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

// Suppression d'un utilisateur
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Seul l'admin ou l'utilisateur lui-même peut supprimer
    if (req.user._id.toString() !== userId && !req.user.isAdmin) {
      return ResponseHelper.forbidden(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }
    
    const result = await userService.deleteUser(userId);
    return ResponseHelper.success(res, result, SUCCESS_MESSAGES.USER.DELETED);
  } catch (error) {
    next(error);
  }
};
