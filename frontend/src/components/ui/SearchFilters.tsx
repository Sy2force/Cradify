import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, MapPin, Star, Calendar } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { debounce } from '@/lib/utils';

export interface SearchFiltersProps {
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: SearchFiltersData) => void;
  className?: string;
}

export interface SearchFiltersData {
  query: string;
  category: string;
  location: string;
  rating: number;
  dateRange: string;
  sortBy: string;
  tags: string[];
}

const categories = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'design', label: 'Design' },
  { value: 'tech', label: 'Technologie' },
  { value: 'medical', label: 'Médical' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'education', label: 'Éducation' },
  { value: 'finance', label: 'Finance' },
];

const sortOptions = [
  { value: 'newest', label: 'Plus récent' },
  { value: 'oldest', label: 'Plus ancien' },
  { value: 'popular', label: 'Plus populaire' },
  { value: 'rating', label: 'Mieux noté' },
  { value: 'name', label: 'Nom A-Z' },
];

const popularTags = [
  'premium', 'moderne', 'élégant', 'créatif', 'professionnel', 
  'minimaliste', 'coloré', 'business', 'artistique', 'corporate'
];

export default function SearchFilters({ 
  onSearchChange, 
  onFiltersChange, 
  className = '' 
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersData>({
    query: '',
    category: 'all',
    location: '',
    rating: 0,
    dateRange: '',
    sortBy: 'newest',
    tags: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Debounced search handler
  const debouncedSearch = debounce((query: string) => {
    onSearchChange(query);
  }, 300);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, query: value };
    setFilters(newFilters);
    debouncedSearch(value);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (key: keyof SearchFiltersData, value: string | number | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Count active filters
    const count = Object.entries(newFilters).filter(([k, v]) => {
      if (k === 'query') return (v as string).length > 0;
      if (k === 'category') return v !== 'all';
      if (k === 'rating') return (v as number) > 0;
      if (k === 'tags') return (v as string[]).length > 0;
      if (k === 'sortBy') return false; // sortBy is not considered an "active" filter
      return v && typeof v === 'string' && v.length > 0;
    }).length;
    setActiveFiltersCount(count);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange('tags', newTags);
  };

  const clearAllFilters = () => {
    const defaultFilters: SearchFiltersData = {
      query: '',
      category: 'all',
      location: '',
      rating: 0,
      dateRange: '',
      sortBy: 'newest',
      tags: [],
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setActiveFiltersCount(0);
  };

  return (
    <div className={`bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-dark-300/50 p-6 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher des cartes de visite..."
            value={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
            aria-label="Rechercher des cartes"
          />
        </div>
        
        <Button
          variant={showAdvanced ? 'primary' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-3 relative"
          aria-label="Filtres avancés"
        >
          <Filter className="h-5 w-5 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200 text-sm"
          aria-label="Sélectionner une catégorie"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200 text-sm"
          aria-label="Trier par"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Effacer tous les filtres"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200/50 dark:border-dark-300/50 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Localisation
                </label>
                <Input
                  type="text"
                  placeholder="Ville, région..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  aria-label="Filtrer par localisation"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Star className="h-4 w-4 inline mr-1" />
                  Note minimum
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200"
                  aria-label="Note minimum"
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={1}>⭐ 1+ étoiles</option>
                  <option value={2}>⭐ 2+ étoiles</option>
                  <option value={3}>⭐ 3+ étoiles</option>
                  <option value={4}>⭐ 4+ étoiles</option>
                  <option value={5}>⭐ 5 étoiles</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Période
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-dark-300 rounded-lg bg-white dark:bg-dark-200"
                  aria-label="Période de création"
                >
                  <option value="">Toutes les périodes</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tags populaires
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-dark-200 dark:text-gray-400 dark:border-dark-300'
                    } border`}
                    aria-label={`Filtrer par tag ${tag}`}
                    aria-pressed={filters.tags.includes(tag)}
                  >
                    {tag}
                    {filters.tags.includes(tag) && (
                      <X className="h-3 w-3 ml-1 inline" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
