const cardService = require('../services/card.service');
const ResponseHelper = require('../utils/responseHelper');
const { SUCCESS_MESSAGES } = require('../constants');

// GET /cards - Get all cards
exports.getAllCards = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const cards = await cardService.getAllCards(search, page, limit);
    return ResponseHelper.success(res, { cards: cards.data, pagination: cards.pagination });
  } catch (error) {
    next(error);
  }
};

// GET /cards/my-cards - Get user's cards
exports.getMyCards = async (req, res, next) => {
  try {
    const cards = await cardService.getCardsByUserId(req.user._id);
    return ResponseHelper.success(res, { cards, count: cards.length });
  } catch (error) {
    next(error);
  }
};

// GET /cards/liked - Get user's liked cards
exports.getLikedCards = async (req, res, next) => {
  try {
    const cards = await cardService.getLikedCards(req.user._id);
    return ResponseHelper.success(res, { cards, count: cards.length });
  } catch (error) {
    next(error);
  }
};

// GET /cards/:id - Get card by ID
exports.getCardById = async (req, res, next) => {
  try {
    const card = await cardService.getCardById(req.params.id);
    return ResponseHelper.success(res, { card });
  } catch (error) {
    next(error);
  }
};

// POST /cards - Create new card (business users only)
exports.createCard = async (req, res, next) => {
  try {
    const card = await cardService.createCard(req.body, req.user._id);
    return ResponseHelper.created(res, { card }, SUCCESS_MESSAGES.CARD.CREATED);
  } catch (error) {
    next(error);
  }
};

// PUT /cards/:id - Update card
exports.updateCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;
    
    const card = await cardService.updateCard(cardId, req.body, userId, isAdmin);
    return ResponseHelper.success(res, { card }, SUCCESS_MESSAGES.CARD.UPDATED);
  } catch (error) {
    next(error);
  }
};

// PATCH /cards/:id - Toggle like
exports.toggleLike = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;
    
    const card = await cardService.likeCard(cardId, userId);
    
    // Check if user is in likes array to determine if liked or unliked
    const isLiked = card.likes.some(like => like._id ? like._id.toString() === userId.toString() : like.toString() === userId.toString());
    const message = isLiked ? SUCCESS_MESSAGES.CARD.LIKED : SUCCESS_MESSAGES.CARD.UNLIKED;
    
    return ResponseHelper.success(res, { 
      card, 
      message,
      likesCount: card.likes.length 
    });
  } catch (error) {
    // Handle service errors with proper status codes
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// DELETE /cards/:id - Delete card
exports.deleteCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;
    
    const result = await cardService.deleteCard(cardId, userId, isAdmin);
    return ResponseHelper.success(res, result, SUCCESS_MESSAGES.CARD.DELETED);
  } catch (error) {
    next(error);
  }
};
