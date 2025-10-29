const express = require('express');
const User = require('../models/user.model');
const Card = require('../models/card.model');
const { auth, adminOnly } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware pour vérifier les permissions admin sur toutes les routes
router.use(auth);
router.use(adminOnly);

// GET /api/admin/stats - Statistiques administrateur
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      businessUsers,
      totalCards,
      recentSignups
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isBusiness: true }),
      Card.countDocuments(),
      User.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      businessUsers,
      totalCards,
      recentSignups,
      systemHealth: activeUsers > totalUsers * 0.7 ? 'good' : 
                   activeUsers > totalUsers * 0.5 ? 'warning' : 'critical'
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur statistiques admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/admin/users - Liste des utilisateurs avec filtres
router.get('/users', async (req, res) => {
  try {
    const { search, status, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    
    // Filtre par statut
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    
    // Recherche par nom ou email
    if (search) {
      query.$or = [
        { 'name.first': { $regex: search, $options: 'i' } },
        { 'name.last': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('name email isBusiness isActive createdAt lastLogin isAdmin')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      User.countDocuments(query)
    ]);

    // Ajouter le nombre de cartes pour chaque utilisateur
    const usersWithCards = await Promise.all(
      users.map(async (user) => {
        const cardsCount = await Card.countDocuments({ user_id: user._id });
        return { ...user, cardsCount };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithCards,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalCount / parseInt(limit)),
          count: totalCount
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur liste utilisateurs admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

// PUT /api/admin/users/:id/status - Activer/désactiver un utilisateur
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Le statut doit être un booléen'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('name email isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Log de l'action admin
    logger.info(`Admin ${req.user.email} a ${isActive ? 'activé' : 'désactivé'} l'utilisateur ${user.email}`);

    res.json({
      success: true,
      data: user,
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    logger.error('Erreur modification statut utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut'
    });
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la suppression d'un autre admin
    if (user.isAdmin && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un autre administrateur'
      });
    }

    // Supprimer toutes les cartes de l'utilisateur
    await Card.deleteMany({ user_id: id });
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    // Log de l'action admin
    logger.info(`Admin ${req.user.email} a supprimé l'utilisateur ${user.email}`);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    logger.error('Erreur suppression utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
});

// GET /api/admin/activity - Journal d'activité système
router.get('/activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Récupérer les activités récentes
    const [recentUsers, recentCards] = await Promise.all([
      User.find()
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) / 2)
        .populate('name'),
      Card.find()
        .select('title user_id createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) / 2)
        .populate('user_id', 'name email')
    ]);

    // Formatage des activités
    const activities = [];

    // Ajouter les nouveaux utilisateurs
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        type: 'user_created',
        user: user.email,
        description: `Nouvel utilisateur créé: ${user.name.first} ${user.name.last}`,
        timestamp: user.createdAt,
        severity: 'low'
      });
    });

    // Ajouter les nouvelles cartes
    recentCards.forEach(card => {
      activities.push({
        id: `card_${card._id}`,
        type: 'card_created',
        user: card.user_id?.email || 'Utilisateur inconnu',
        description: `Nouvelle carte créée: ${card.title}`,
        timestamp: card.createdAt,
        severity: 'low'
      });
    });

    // Trier par date décroissante
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activities.slice(0, parseInt(limit)),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur journal d\'activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du journal d\'activité'
    });
  }
});

// GET /api/admin/dashboard - Données complètes du dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Exécuter toutes les requêtes en parallèle
    const [statsResponse, usersResponse, activityResponse] = await Promise.all([
      // Stats
      (async () => {
        const [totalUsers, activeUsers, businessUsers, totalCards, recentSignups] = await Promise.all([
          User.countDocuments(),
          User.countDocuments({ isActive: true }),
          User.countDocuments({ isBusiness: true }),
          Card.countDocuments(),
          User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          })
        ]);
        
        return {
          totalUsers,
          activeUsers,
          businessUsers,
          totalCards,
          recentSignups,
          systemHealth: activeUsers > totalUsers * 0.7 ? 'good' : 
                       activeUsers > totalUsers * 0.5 ? 'warning' : 'critical'
        };
      })(),
      
      // Utilisateurs récents
      (async () => {
        const users = await User.find()
          .select('name email isBusiness isActive createdAt lastLogin isAdmin')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
          
        return Promise.all(
          users.map(async (user) => {
            const cardsCount = await Card.countDocuments({ user_id: user._id });
            return { ...user, cardsCount };
          })
        );
      })(),
      
      // Activité récente
      (async () => {
        const [recentUsers, recentCards] = await Promise.all([
          User.find().select('name email createdAt').sort({ createdAt: -1 }).limit(10),
          Card.find().select('title user_id createdAt').sort({ createdAt: -1 }).limit(10).populate('user_id', 'name email')
        ]);

        const activities = [];
        recentUsers.forEach(user => {
          activities.push({
            id: `user_${user._id}`,
            type: 'user_created',
            user: user.email,
            description: `Nouvel utilisateur: ${user.name.first} ${user.name.last}`,
            timestamp: user.createdAt,
            severity: 'low'
          });
        });
        
        recentCards.forEach(card => {
          activities.push({
            id: `card_${card._id}`,
            type: 'card_created',
            user: card.user_id?.email || 'Inconnu',
            description: `Nouvelle carte: ${card.title}`,
            timestamp: card.createdAt,
            severity: 'low'
          });
        });

        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
      })()
    ]);

    res.json({
      success: true,
      data: {
        stats: statsResponse,
        users: usersResponse,
        activityLogs: activityResponse
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erreur dashboard admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données du dashboard'
    });
  }
});

module.exports = router;
