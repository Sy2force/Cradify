const Card = require('../models/card.model');
const fs = require('fs').promises;
const path = require('path');

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
   * Get all cards
   * @returns {Array} All cards
   */
  async getAllCards() {
    const cards = await Card.find()
      .populate('user_id', 'name email')
      .populate('likes', 'name email')
      .sort({ createdAt: -1 });
    
    return cards;
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
    const card = await Card.findById(cardId);
    
    if (!card) {
      throw new Error('Card not found');
    }

    const likeIndex = card.likes.indexOf(userId);
    
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
