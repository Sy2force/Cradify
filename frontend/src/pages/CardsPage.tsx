import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List, RefreshCw, Heart, Eye, Star, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import SearchFilters, { SearchFiltersData } from '@/components/ui/SearchFilters';

interface MockCard {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  likes: number;
  views: number;
  category: string;
  rating: number;
  isLiked: boolean;
  isPremium: boolean;
}

type ViewMode = 'grid' | 'list';

interface PageProps {
  className?: string;
}

export default function CardsPage({ className }: PageProps = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersData>({
    query: '',
    category: 'all',
    location: '',
    rating: 0,
    dateRange: '',
    sortBy: 'newest',
    tags: [],
  });

  const [mockCards, setMockCards] = useState<MockCard[]>([
    {
      id: '1',
      title: 'Design Studio Moderne',
      description: 'Carte élégante pour studio de design avec palette de couleurs contemporaine',
      image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=250&fit=crop',
      author: 'Marie Dubois',
      likes: 124,
      views: 1250,
      category: 'design',
      rating: 4.8,
      isLiked: false,
      isPremium: true
    },
    {
      id: '2', 
      title: 'Tech Startup Innovante',
      description: 'Carte moderne pour startup technologique avec design minimaliste',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      author: 'Thomas Martin',
      likes: 89,
      views: 890,
      category: 'tech',
      rating: 4.6,
      isLiked: true,
      isPremium: false
    },
    {
      id: '3',
      title: 'Cabinet Médical Premium',
      description: 'Carte professionnelle pour cabinet médical avec style classique',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      author: 'Dr. Sarah Wilson',
      likes: 156,
      views: 2100,
      category: 'medical',
      rating: 4.9,
      isLiked: false,
      isPremium: true
    },
    {
      id: '4',
      title: 'Restaurant Gastronomique',
      description: 'Carte élégante pour restaurant haut de gamme avec touches dorées',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop',
      author: 'Chef Antoine',
      likes: 203,
      views: 3200,
      category: 'restaurant',
      rating: 4.7,
      isLiked: true,
      isPremium: false
    },
    {
      id: '5',
      title: 'Consultant Marketing',
      description: 'Carte dynamique pour consultant en marketing digital',
      image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop',
      author: 'Julie Petit',
      likes: 67,
      views: 650,
      category: 'marketing',
      rating: 4.4,
      isLiked: false,
      isPremium: false
    },
    {
      id: '6',
      title: 'Architecte Contemporain',
      description: 'Carte architecturale avec lignes épurées et design avant-gardiste',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop',
      author: 'Pierre Leblanc',
      likes: 178,
      views: 1800,
      category: 'architecture',
      rating: 4.8,
      isLiked: true,
      isPremium: true
    }
  ]);

  const filteredAndSortedCards = useMemo(() => {
    let filtered = mockCards.filter(card => {
      const matchesSearch = searchFilters.query === '' || 
        card.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        card.description.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        card.author.toLowerCase().includes(searchFilters.query.toLowerCase());
      const matchesCategory = searchFilters.category === 'all' || card.category === searchFilters.category;
      const matchesRating = searchFilters.rating === 0 || card.rating >= searchFilters.rating;
      const matchesTags = searchFilters.tags.length === 0 || 
        searchFilters.tags.some((tag: string) => card.title.toLowerCase().includes(tag.toLowerCase()) || 
                                      card.description.toLowerCase().includes(tag.toLowerCase()));
      
      return matchesSearch && matchesCategory && matchesRating && matchesTags;
    });

    switch (searchFilters.sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.likes - a.likes);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'oldest':
        return filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      default:
        return filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
  }, [searchFilters]);

  const handleRefresh = (): void => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSearchChange = (): void => {
    // Search change is handled by the SearchFilters component
  };

  const handleFiltersChange = (filters: SearchFiltersData): void => {
    setSearchFilters(filters);
  };

  const toggleLike = (cardId: string): void => {
    // TODO: Implement actual like functionality
    setMockCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, isLiked: !card.isLiked, likes: card.isLiked ? card.likes - 1 : card.likes + 1 }
        : card
    ));
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark-50 ${className || ''}`}>
      <div className="container-cardify section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-4">
            Galerie de Cartes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Découvrez notre collection de cartes de visite professionnelles créées par la communauté
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchFilters
            onSearchChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
          />
        </motion.div>

        {/* View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedCards.length} carte{filteredAndSortedCards.length > 1 ? 's' : ''} trouvée{filteredAndSortedCards.length > 1 ? 's' : ''}
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex glass-effect border border-gray-200 dark:border-dark-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-200'
                }`}
                title="Affichage en grille"
                aria-label="Basculer vers l'affichage en grille"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-200'
                }`}
                title="Affichage en liste"
                aria-label="Basculer vers l'affichage en liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Actualiser les cartes"
              aria-label="Actualiser les cartes"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={viewMode === 'grid' ? 'grid-cardify' : 'space-y-6'}
        >
          {filteredAndSortedCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`card card-hover ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'} bg-gray-100 dark:bg-dark-200 rounded-lg`}>
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Premium Badge */}
                {card.isPremium && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-semibold rounded-full">
                    Premium
                  </div>
                )}

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(card.id)}
                  className={`absolute top-2 right-2 p-2 rounded-full glass-effect transition-all ${
                    card.isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                  } hover:scale-110`}
                  title={card.isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-label={card.isLiked ? `Retirer ${card.title} des favoris` : `Ajouter ${card.title} aux favoris`}
                >
                  <Heart className={`w-4 h-4 ${card.isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {card.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Par {card.author}
                  </p>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-4 border-t divider">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{card.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{card.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{card.rating}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="ghost" title="Partager cette carte" aria-label={`Partager ${card.title}`}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-200 rounded-full flex-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune carte trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button variant="outline" onClick={() => {
              setSearchFilters({
                query: '',
                category: 'all',
                location: '',
                rating: 0,
                dateRange: '',
                sortBy: 'newest',
                tags: [],
              });
            }}>
              Réinitialiser les filtres
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
