import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card as CardComponent } from '../components/ui/Card';
import { apiService } from '../lib/api';
import { Card } from '../types';
import { Search, Plus, Heart, MapPin, Phone, Mail, Globe, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  useEffect(() => {
    const filtered = cards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [cards, searchTerm]);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCards();
      setCards(response || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Erreur lors du chargement des cartes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (cardId: string) => {
    try {
      await apiService.likeCard(cardId);
      toast.success('Carte likée !');
      fetchCards(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error liking card:', error);
      toast.error('Erreur lors du like');
    }
  };

  const handleDelete = async (cardId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      try {
        await apiService.deleteCard(cardId);
        toast.success('Carte supprimée !');
        fetchCards();
      } catch (error) {
        console.error('Error deleting card:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const isOwner = (card: Card) => {
    return user && (typeof card.user_id === 'string' ? card.user_id === user._id : card.user_id._id === user._id);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour voir vos cartes.</p>
          <Link to="/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Cartes</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos cartes de visite numériques ({cards.length} carte{cards.length !== 1 ? 's' : ''})
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/create-card">
            <Button className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Créer une carte
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher dans vos cartes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && cards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune carte créée</h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre première carte de visite numérique.
          </p>
          <Link to="/create-card">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première carte
            </Button>
          </Link>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && cards.length > 0 && filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
          <p className="text-gray-600">
            Aucune carte ne correspond à votre recherche "{searchTerm}".
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && filteredCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <CardComponent key={card._id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600">{card.subtitle}</p>
                  </div>
                  {card.image?.url && (
                    <div className="ml-4">
                      <img
                        src={card.image.url}
                        alt={card.image.alt || card.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{card.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{card.email}</span>
                  </div>
                  {card.web && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{card.web}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{card.address.city}, {card.address.country}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {card.description}
                </p>

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
                        Voir
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
            </CardComponent>
          ))}
        </div>
      )}
    </div>
  );
}
