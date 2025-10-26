const cardService = require('../services/card.service');
const ResponseHelper = require('../helpers/responseHelper');
const ValidationHelper = require('../helpers/validationHelper');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');

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
    
    const result = await cardService.likeCard(cardId, userId);
    const message = result.isLiked ? SUCCESS_MESSAGES.CARD.LIKED : SUCCESS_MESSAGES.CARD.UNLIKED;
    
    return ResponseHelper.success(res, { 
      card: result.card, 
      message,
      likesCount: result.card.likes.length 
    });
  } catch (error) {
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
