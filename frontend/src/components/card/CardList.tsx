import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Search, Filter } from 'lucide-react';
import { Card } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import CardItem from './CardItem';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CardListProps {
  showMyCards?: boolean;
  className?: string;
}

export default function CardList({ showMyCards = false, className }: CardListProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCards();
  }, [showMyCards]);

  useEffect(() => {
    filterCards();
  }, [cards, searchQuery]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const response = showMyCards 
        ? await apiClient.getMyCards()
        : await apiClient.getAllCards();
      
      if (response.success && response.data?.cards) {
        setCards(response.data.cards);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des cartes';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCards = () => {
    if (!searchQuery.trim()) {
      setFilteredCards(cards);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cards.filter(card =>
      card.title.toLowerCase().includes(query) ||
      card.subtitle.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      card.email.toLowerCase().includes(query) ||
      card.address.city.toLowerCase().includes(query)
    );
    
    setFilteredCards(filtered);
  };

  const handleCardEdit = (cardId: string) => {
    // Navigate to edit form
    window.location.href = `/cards/edit/${cardId}`;
  };

  const handleCardDelete = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    try {
      await apiClient.deleteCard(cardId);
      setCards(prev => prev.filter(card => card._id !== cardId));
      toast.success('Carte supprimée avec succès');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {showMyCards ? 'Mes Cartes' : 'Toutes les Cartes'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredCards.length} carte{filteredCards.length !== 1 ? 's' : ''} trouvée{filteredCards.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
              title="Vue grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
              title="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher des cartes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filtres</span>
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div className="text-center text-gray-500 dark:text-gray-400">
              Filtres avancés (à développer)
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid/List */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Search className="w-12 h-12 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'Aucune carte trouvée' : 'Aucune carte disponible'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : showMyCards 
                ? 'Vous n\'avez pas encore créé de cartes'
                : 'Aucune carte n\'a été publiée pour le moment'
            }
          </p>
        </div>
      ) : (
        <motion.div
          className={cn(
            'grid gap-6',
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          )}
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <motion.div
                key={card._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CardItem
                  card={card}
                  viewMode={viewMode}
                  onEdit={handleCardEdit}
                  onDelete={handleCardDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load More Button (for pagination) */}
      {filteredCards.length > 0 && filteredCards.length % 12 === 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Charger plus
          </Button>
        </div>
      )}
    </div>
  );
}
