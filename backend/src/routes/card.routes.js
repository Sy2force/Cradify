const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const { auth, isBusiness } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createCardSchema, updateCardSchema } = require('../validators/card.validator');

// Public routes
router.get('/', cardController.getAllCards);

// Protected routes (specific routes before /:id to avoid conflicts)
router.get('/my-cards', auth, cardController.getMyCards);
router.get('/liked', auth, cardController.getLikedCards);

// Dynamic route (must be last)
router.get('/:id', cardController.getCardById);

// CRUD operations
router.post('/', auth, isBusiness, validate(createCardSchema), cardController.createCard);
router.put('/:id', auth, validate(updateCardSchema), cardController.updateCard);
router.patch('/:id/like', auth, cardController.toggleLike);
router.delete('/:id', auth, cardController.deleteCard);

module.exports = router;
