import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  User, 
  Tag,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from './Button';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  dateRange: 'all' | 'week' | 'month' | 'year';
  isBusiness: boolean | null;
  hasImage: boolean | null;
  sortBy: 'relevance' | 'date' | 'alphabetical' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const categories = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'tech', label: 'Technologie & IT' },
  { value: 'creative', label: 'Créatif & Design' },
  { value: 'medical', label: 'Médical & Santé' },
  { value: 'education', label: 'Éducation & Formation' },
  { value: 'consulting', label: 'Conseil & Services' },
  { value: 'retail', label: 'Commerce & Vente' },
  { value: 'other', label: 'Autres' }
];

const locations = [
  { value: '', label: 'Toutes les localisations' },
  { value: 'paris', label: 'Paris' },
  { value: 'lyon', label: 'Lyon' },
  { value: 'marseille', label: 'Marseille' },
  { value: 'toulouse', label: 'Toulouse' },
  { value: 'nice', label: 'Nice' },
  { value: 'nantes', label: 'Nantes' },
  { value: 'strasbourg', label: 'Strasbourg' },
  { value: 'lille', label: 'Lille' },
  { value: 'bordeaux', label: 'Bordeaux' },
  { value: 'other', label: 'Autres villes' }
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  isLoading = false,
  placeholder = "Rechercher des cartes de visite...",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    dateRange: 'all',
    isBusiness: null,
    hasImage: null,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      category: '',
      location: '',
      dateRange: 'all',
      isBusiness: null,
      hasImage: null,
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onClear();
  };

  const hasActiveFilters = filters.query || filters.category || filters.location || 
                          filters.dateRange !== 'all' || filters.isBusiness !== null || 
                          filters.hasImage !== null || filters.sortBy !== 'relevance';

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barre de recherche principale */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => handleInputChange('query', e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Effacer les filtres"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded-lg transition-colors ${
              hasActiveFilters 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Filtres avancés"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Panel de filtres avancés */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="inline w-4 h-4 mr-2" />
                Catégorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                aria-label="Sélectionner une catégorie"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Localisation
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                aria-label="Sélectionner une localisation"
              >
                {locations.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
            </div>

            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Période
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleInputChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                aria-label="Sélectionner une période"
              >
                <option value="all">Toute période</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {/* Type de compte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Type de compte
              </label>
              <select
                value={filters.isBusiness === null ? '' : filters.isBusiness.toString()}
                onChange={(e) => handleInputChange('isBusiness', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                aria-label="Sélectionner le type de compte"
              >
                <option value="">Tous les types</option>
                <option value="true">Comptes business</option>
                <option value="false">Comptes personnels</option>
              </select>
            </div>

            {/* Avec image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contenu
              </label>
              <select
                value={filters.hasImage === null ? '' : filters.hasImage.toString()}
                onChange={(e) => handleInputChange('hasImage', e.target.value === '' ? null : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par contenu avec/sans image"
              >
                <option value="">Toutes les cartes</option>
                <option value="true">Avec image</option>
                <option value="false">Sans image</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trier par
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  aria-label="Choisir le critère de tri"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="date">Date de création</option>
                  <option value="alphabetical">Ordre alphabétique</option>
                  <option value="popularity">Popularité</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  aria-label="Choisir l'ordre de tri"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters && "Filtres actifs appliqués"}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!hasActiveFilters}
              >
                Effacer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleSearch();
                  setIsExpanded(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
