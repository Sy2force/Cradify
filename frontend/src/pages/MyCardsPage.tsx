import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Heart,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cardService } from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card as CardType, PageProps, ChangeEvent } from '@/types';
import { getErrorMessage, debounce, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MyCardsPage({ className }: PageProps = {}) {
  const { user, isBusiness } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardType[]>([]);
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not business user
  useEffect(() => {
    if (user && !isBusiness) {
      navigate('/cards');
      toast.error('Vous devez avoir un compte Business pour accéder à cette page');
    }
  }, [user, isBusiness, navigate]);

  // Load user's cards
  const loadMyCards = async (showRefreshToast = false) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await cardService.getMyCards();
      setCards(response);
      setFilteredCards(response);
      
      if (showRefreshToast) {
        toast.success('Cartes mises à jour !');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh cards
  const refreshCards = async () => {
    setIsRefreshing(true);
    await loadMyCards(true);
  };

  // Filter cards based on search
  useEffect(() => {
    let filtered = [...cards];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(query) ||
        card.subtitle.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.email.toLowerCase().includes(query)
      );
    }

    setFilteredCards(filtered);
  }, [cards, searchQuery]);

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  // Handle delete card
  const handleDeleteCard = async (card: CardType) => {
    setCardToDelete(card);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      setIsDeleting(true);
      await cardService.deleteCard(cardToDelete._id);
      
      setCards(prevCards => prevCards.filter(card => card._id !== cardToDelete._id));
      setCardToDelete(null);
      toast.success('Carte supprimée avec succès');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit card
  const handleEditCard = (cardId: string) => {
    navigate(`/edit-card/${cardId}`);
  };

  // Handle like card (for own cards - just for stats)
  const handleLikeCard = async (cardId: string) => {
    try {
      await cardService.toggleLike(cardId);
      
      // Update local state
      setCards(prevCards =>
        prevCards.map(card => {
          if (card._id === cardId) {
            const isLiked = card.likes.includes(user!._id);
            return {
              ...card,
              likes: isLiked 
                ? card.likes.filter(id => id !== user!._id)
                : [...card.likes, user!._id]
            };
          }
          return card;
        })
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Load cards on mount
  useEffect(() => {
    if (user && isBusiness) {
      loadMyCards();
    }
  }, [user, isBusiness]);

  // Don't render if not business user
  if (!user || !isBusiness) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos cartes..." />
      </div>
    );
  }

  const totalLikes = cards.reduce((acc, card) => acc + card.likes.length, 0);
  const averageLikes = cards.length > 0 ? Math.round(totalLikes / cards.length) : 0;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 ${className || ''}`}>
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border-b border-gray-200/50 dark:border-dark-300/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Mes Cartes
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Gérez vos cartes de visite professionnelles
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={refreshCards}
                isLoading={isRefreshing}
                leftIcon={!isRefreshing ? <RefreshCw size={16} /> : undefined}
              >
                Actualiser
              </Button>
              <Link to="/create-card">
                <Button leftIcon={<Plus />}>
                  Nouvelle Carte
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8"
          >
            <div className="bg-white/60 dark:bg-dark-200/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-dark-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cartes Créées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{cards.length}</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-dark-200/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-dark-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total J'aime</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</p>
                </div>
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-dark-200/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-dark-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne J'aime</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageLikes}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-dark-200/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-dark-300/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dernière Création</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {cards.length > 0 
                      ? formatDate(new Date(Math.max(...cards.map(card => new Date(card.createdAt).getTime()))))
                      : 'Aucune'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          {cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <div className="max-w-md mx-auto">
                <Input
                  type="search"
                  placeholder="Rechercher dans mes cartes..."
                  leftIcon={<Search size={20} />}
                  onChange={(e: ChangeEvent) => debouncedSearch(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cards.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune carte créée
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Commencez par créer votre première carte de visite professionnelle. 
              C'est rapide et facile !
            </p>
            <Link to="/create-card">
              <Button size="lg" leftIcon={<Plus />}>
                Créer ma Première Carte
              </Button>
            </Link>
          </motion.div>
        ) : filteredCards.length === 0 ? (
          // No Results
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune carte trouvée
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Essayez de modifier votre recherche
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery('')}
            >
              Voir Toutes mes Cartes
            </Button>
          </motion.div>
        ) : (
          // Cards Grid
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredCards.map((card, index) => (
                <motion.div
                  key={card._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.05 }
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    card={card}
                    onLike={() => handleLikeCard(card._id)}
                    onEdit={() => handleEditCard(card._id)}
                    onDelete={() => handleDeleteCard(card)}
                    showActions={true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Results Count */}
        {filteredCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400"
          >
            {filteredCards.length} carte{filteredCards.length > 1 ? 's' : ''}
            {searchQuery && ` trouvée${filteredCards.length > 1 ? 's' : ''} pour "${searchQuery}"`}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {cardToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-100 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Supprimer la carte
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cette action est irréversible
                  </p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer la carte <strong>"{cardToDelete.title}"</strong> ? 
                Cette action ne peut pas être annulée.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCardToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  isLoading={isDeleting}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
