const cardService = require('../services/card.service');

// GET /cards - Get all cards
exports.getAllCards = async (req, res, next) => {
  try {
    const cards = await cardService.getAllCards();
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

// GET /cards/my-cards - Get user's cards
exports.getMyCards = async (req, res, next) => {
  try {
    const cards = await cardService.getCardsByUserId(req.user._id);
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

// GET /cards/liked - Get user's liked cards
exports.getLikedCards = async (req, res, next) => {
  try {
    const cards = await cardService.getLikedCards(req.user._id);
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

// GET /cards/:id - Get card by ID
exports.getCardById = async (req, res, next) => {
  try {
    const card = await cardService.getCardById(req.params.id);
    res.json(card);
  } catch (error) {
    next(error);
  }
};

// POST /cards - Create new card (business users only)
exports.createCard = async (req, res, next) => {
  try {
    const card = await cardService.createCard(req.body, req.user._id);
    
    res.status(201).json({
      message: 'Card created successfully',
      card
    });
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
    
    res.json({
      message: 'Card updated successfully',
      card
    });
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
    
    const isLiked = card.likes.some(like => like._id.toString() === userId.toString());
    
    res.json({
      message: isLiked ? 'Card liked' : 'Card unliked',
      card,
      likesCount: card.likes.length
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
    res.json(result);
  } catch (error) {
    next(error);
  }
};
