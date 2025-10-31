import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../lib/api';
import { Card } from '../types';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { AdvancedSearch } from '../components/ui/AdvancedSearch';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Heart, Search, Edit, Trash2, Plus, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export function CardsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Filtre par terme de recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
          card.title.toLowerCase().includes(searchLower) ||
          card.subtitle.toLowerCase().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower) ||
          card.email.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }

      // Filtres avancés
      if (searchFilters) {
        // Filtre par catégorie (simulé basé sur le titre/description)
        if (searchFilters.category) {
          const categoryMatch = {
            'business': ['business', 'finance', 'entreprise', 'société'],
            'tech': ['tech', 'développeur', 'programmeur', 'informatique', 'digital'],
            'creative': ['design', 'créatif', 'art', 'graphique', 'marketing'],
            'medical': ['médecin', 'santé', 'médical', 'docteur', 'infirmier'],
            'education': ['professeur', 'enseignant', 'formation', 'école', 'université'],
            'consulting': ['consultant', 'conseil', 'expert', 'coaching'],
            'retail': ['commerce', 'vente', 'magasin', 'boutique']
          };
          
          const keywords = categoryMatch[searchFilters.category as keyof typeof categoryMatch] || [];
          const cardText = `${card.title} ${card.subtitle} ${card.description}`.toLowerCase();
          const matchesCategory = keywords.some(keyword => cardText.includes(keyword));
          if (!matchesCategory) return false;
        }

        // Filtre par localisation (simulé basé sur l'adresse)
        if (searchFilters.location) {
          const locationText = `${card.title} ${card.subtitle} ${card.description}`.toLowerCase();
          if (!locationText.includes(searchFilters.location.toLowerCase())) return false;
        }

        // Filtre par type de compte (simulé)
        if (searchFilters.isBusiness !== null) {
          const isBusinessCard = card.title.toLowerCase().includes('business') || 
                                card.subtitle.toLowerCase().includes('ceo') ||
                                card.subtitle.toLowerCase().includes('manager') ||
                                card.subtitle.toLowerCase().includes('director');
          if (searchFilters.isBusiness !== isBusinessCard) return false;
        }

        // Filtre par présence d'image
        if (searchFilters.hasImage !== null) {
          const hasImage = Boolean(card.image?.url || card.imageUrl);
          if (searchFilters.hasImage !== hasImage) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (!searchFilters?.sortBy || searchFilters.sortBy === 'relevance') {
        return 0; // Ordre par défaut
      }

      let comparison = 0;
      switch (searchFilters.sortBy) {
        case 'date':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'alphabetical':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'popularity':
          comparison = (a.likes?.length || 0) - (b.likes?.length || 0);
          break;
      }

      return searchFilters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [cards, searchTerm, searchFilters]);

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCards();
      setCards(response || []);
    } catch {
      try {
        const mockCards = await apiService.getMockCards();
        // Filtrer seulement les cartes de l'utilisateur connecté en mode démo
        const userCards = user ? mockCards.filter(card => 
          card.user_id === user._id || card.user_id === 'demo-user-current'
        ) : [];
        setCards(userCards);
      } catch {
        setCards([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleLike = useCallback(async (cardId: string) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        toast.success(t('cards.likedDemo'));
        return;
      }
      await apiService.likeCard(cardId);
      toast.success(t('cards.liked'));
      fetchCards(); // Refresh to get updated like count
    } catch {
      toast.error(t('cards.likeError'));
    }
  }, [fetchCards, t]);

  const confirmDialog = useConfirmDialog();

  const handleDelete = useCallback(async (cardId: string) => {
    const confirmed = await confirmDialog.confirm({
      title: t('cards.deleteTitle'),
      message: t('cards.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger'
    });
    
    if (confirmed) {
      try {
        if (process.env.NODE_ENV === 'production') {
          toast.success(t('cards.deletedDemo'));
          return;
        }
        await apiService.deleteCard(cardId);
        toast.success(t('cards.deleted'));
        fetchCards();
      } catch {
        toast.error(t('cards.deleteError'));
      }
    }
  }, [fetchCards, t, confirmDialog]);

  const isOwner = (card: Card) => {
    return user && (typeof card.user_id === 'string' ? card.user_id === user._id : card.user_id._id === user._id);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {searchTerm ? t('cards.noResults') : t('cards.noCards')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            {searchTerm 
              ? t('cards.noResultsDesc') 
              : t('cards.noCardsDesc')}
          </p>
          <Link to="/login">
            <Button>{t('cards.signIn')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('cards.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t('cards.subtitle')} ({filteredCards.length} {filteredCards.length === 1 ? t('cards.cardCount') : t('cards.cardCountPlural')})
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/create-card">
            <Button className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              {t('cards.createCard')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="mb-8">
        <AdvancedSearch
          onSearch={(filters) => {
            setSearchFilters(filters);
            setSearchTerm(filters.query);
          }}
          onClear={() => {
            setSearchFilters(null);
            setSearchTerm('');
          }}
          isLoading={isLoading}
          placeholder={t('cards.searchPlaceholder')}
        />
      </div>

      {/* Loading */}
      {isLoading && <PageLoader text={t('cards.loading')} />}

      {/* Empty State */}
      {!isLoading && cards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cards.noCards')}</h3>
          <p className="text-gray-600 mb-6">
            {t('cards.noCardsDesc')}
          </p>
          <Link to="/create-card">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('cards.createFirstCard')}
            </Button>
          </Link>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && cards.length > 0 && filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cards.noResults')}</h3>
          <p className="text-gray-600">
            {t('cards.noResultsDesc')} "{searchTerm}".
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filteredCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div key={card._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700">
              {/* Card Header avec gradient */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold mb-3">{card.subtitle}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{card.description}</p>
                  </div>
                  {(card.image?.url || card.imageUrl) && (
                    <div className="ml-4">
                      <img
                        src={card.image?.url || card.imageUrl}
                        alt={card.image?.alt || card.imageAlt || card.title}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Card Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{card.phone}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(card._id)}
                      className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      <span>{card.likes?.length || 0}</span>
                    </button>
                    <span className="text-xs text-gray-400">
                      #{card.bizNumber}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link to={`/cards/${card._id}`}>
                      <Button variant="ghost" size="sm">
                        {t('cards.view')}
                      </Button>
                    </Link>
                    {isOwner(card) && (
                      <>
                        <Link to={`/cards/${card._id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(card._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
      />
    </div>
  );
}
