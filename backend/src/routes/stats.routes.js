const express = require('express');
const Card = require('../models/card.model');
const User = require('../models/user.model');
const { auth } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/stats - Statistiques globales publiques
router.get('/', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCards,
      businessUsers,
      totalLikes,
      cardsThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      Card.countDocuments(),
      User.countDocuments({ isBusiness: true }),
      Card.aggregate([
        { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
      ]),
      Card.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        business: businessUsers,
        personal: totalUsers - businessUsers
      },
      cards: {
        total: totalCards,
        thisMonth: cardsThisMonth,
        totalLikes: totalLikes[0]?.totalLikes || 0
      },
      engagement: {
        averageLikesPerCard: totalCards > 0 ? Math.round((totalLikes[0]?.totalLikes || 0) / totalCards * 100) / 100 : 0,
        cardsPerUser: totalUsers > 0 ? Math.round(totalCards / totalUsers * 100) / 100 : 0
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur statistiques globales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/stats/user - Statistiques utilisateur (authentifié)
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      userCards,
      totalLikes,
      totalViews,
      recentActivity
    ] = await Promise.all([
      Card.countDocuments({ user_id: userId }),
      Card.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
      ]),
      Card.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      Card.find({ user_id: userId })
        .select('title likes createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const userStats = {
      cards: {
        total: userCards,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        totalViews: totalViews[0]?.totalViews || 0,
        averageLikes: userCards > 0 ? Math.round((totalLikes[0]?.totalLikes || 0) / userCards * 100) / 100 : 0
      },
      recentCards: recentActivity.map(card => ({
        id: card._id,
        title: card.title,
        likes: card.likes,
        createdAt: card.createdAt
      }))
    };

    res.json({
      success: true,
      data: userStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur statistiques utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques utilisateur'
    });
  }
});

// GET /api/stats/trending - Cartes tendances
router.get('/trending', async (req, res) => {
  try {
    const timeRange = req.query.range || '7'; // 7 jours par défaut
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const trendingCards = await Card.find({
      createdAt: { $gte: startDate }
    })
    .populate('user_id', 'name image')
    .sort({ likes: -1, createdAt: -1 })
    .limit(10)
    .select('title subtitle likes createdAt user_id');

    const trending = trendingCards.map(card => ({
      id: card._id,
      title: card.title,
      subtitle: card.subtitle,
      likes: card.likes,
      createdAt: card.createdAt,
      author: {
        name: `${card.user_id.name.first} ${card.user_id.name.last}`,
        image: card.user_id.image?.url
      }
    }));

    res.json({
      success: true,
      data: trending,
      range: `${timeRange} jours`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur cartes tendances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cartes tendances'
    });
  }
});

// GET /api/stats/activity - Activité récente
router.get('/activity', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    
    const recentCards = await Card.find()
      .populate('user_id', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title user_id createdAt');

    const activity = recentCards.map(card => ({
      id: card._id,
      type: 'card_created',
      title: card.title,
      user: `${card.user_id.name.first} ${card.user_id.name.last}`,
      createdAt: card.createdAt
    }));

    res.json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur activité récente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'activité récente'
    });
  }
});

module.exports = router;
