const Card = require('../models/card.model');

class CardService {
  /**
   * Create a new card (business users only)
   * @param {Object} cardData - Card data
   * @param {string} userId - User ID
   * @returns {Object} Created card
   */
  async createCard(cardData, userId) {
    const card = new Card({
      ...cardData,
      user_id: userId
    });

    await card.save();
    await card.populate('user_id', 'name email');

    // Card created successfully in database

    return card;
  }

  /**
   * Get all cards with optional search and pagination
   * @param {string} search - Search term
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Cards data with pagination
   */
  async getAllCards(search, page = 1, limit = 10) {
    let query = {};
    
    // Add search functionality
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const cards = await Card.find(query)
      .populate('user_id', 'name email')
      .populate('likes', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Card.countDocuments(query);
    
    return {
      data: cards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get card by ID
   * @param {string} cardId - Card ID
   * @returns {Object} Card data
   */
  async getCardById(cardId) {
    try {
      const card = await Card.findById(cardId)
        .populate('user_id', 'name email')
        .populate('likes', 'name email');
      
      if (!card) {
        const error = new Error('Card not found');
        error.status = 404;
        throw error;
      }
      
      return card;
    } catch (error) {
      if (error.name === 'CastError') {
        const err = new Error('Invalid card ID');
        err.status = 400;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Get cards by user ID
   * @param {string} userId - User ID
   * @returns {Array} User's cards
   */
  async getCardsByUserId(userId) {
    const cards = await Card.find({ user_id: userId })
      .populate('user_id', 'name email')
      .populate('likes', 'name email')
      .sort({ createdAt: -1 });
    
    return cards;
  }

  /**
   * Update card
   * @param {string} cardId - Card ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Is user admin
   * @returns {Object} Updated card
   */
  async updateCard(cardId, updateData, userId, isAdmin = false) {
    try {
      const card = await Card.findById(cardId);
      
      if (!card) {
        const error = new Error('Card not found');
        error.status = 404;
        throw error;
      }

      // Check if user can update this card
      if (!isAdmin && card.user_id.toString() !== userId.toString()) {
        const error = new Error('Unauthorized to update this card');
        error.status = 403;
        throw error;
      }

      // Remove fields that shouldn't be updated
      delete updateData.bizNumber;
      delete updateData.likes;
      delete updateData.user_id;
      delete updateData.createdAt;

      const updatedCard = await Card.findByIdAndUpdate(
        cardId,
        updateData,
        { new: true, runValidators: true }
      ).populate('user_id', 'name email').populate('likes', 'name email');

      // Card updated successfully in database

      return updatedCard;
    } catch (error) {
      if (error.name === 'CastError') {
        const err = new Error('Invalid card ID');
        err.status = 400;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Delete card
   * @param {string} cardId - Card ID
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Is user admin
   */
  async deleteCard(cardId, userId, isAdmin = false) {
    try {
      const card = await Card.findById(cardId);
      
      if (!card) {
        const error = new Error('Card not found');
        error.status = 404;
        throw error;
      }

      // Check if user can delete this card
      if (!isAdmin && card.user_id.toString() !== userId.toString()) {
        const error = new Error('Unauthorized to delete this card');
        error.status = 403;
        throw error;
      }

      await Card.findByIdAndDelete(cardId);

      // Card deleted successfully from database

      return { message: 'Card deleted successfully' };
    } catch (error) {
      if (error.name === 'CastError') {
        const err = new Error('Invalid card ID');
        err.status = 400;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Like/Unlike card
   * @param {string} cardId - Card ID
   * @param {string} userId - User ID
   * @returns {Object} Updated card
   */
  async likeCard(cardId, userId) {
    try {
      const card = await Card.findById(cardId);
      
      if (!card) {
        const error = new Error('Card not found');
        error.status = 404;
        throw error;
      }

      // Check if user already liked the card (compare ObjectId strings)
      const userIdStr = userId.toString();
      const likeIndex = card.likes.findIndex(like => like.toString() === userIdStr);
      
      if (likeIndex > -1) {
        // Unlike: remove user from likes array
        card.likes.splice(likeIndex, 1);
      } else {
        // Like: add user to likes array
        card.likes.push(userId);
      }

      await card.save();
      await card.populate('user_id', 'name email');
      await card.populate('likes', 'name email');

      // Card likes updated successfully in database

      return card;
    } catch (error) {
      if (error.name === 'CastError') {
        const err = new Error('Invalid card ID');
        err.status = 400;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Get user's liked cards
   * @param {string} userId - User ID
   * @returns {Array} Liked cards
   */
  async getLikedCards(userId) {
    const cards = await Card.find({ likes: userId })
      .populate('user_id', 'name email')
      .populate('likes', 'name email')
      .sort({ createdAt: -1 });
    
    return cards;
  }

}

module.exports = new CardService();
