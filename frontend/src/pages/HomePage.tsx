import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Card as CardType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export function HomePage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const cardsData = await apiService.getCards();
      setCards(cardsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des cartes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (cardId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour aimer une carte');
      return;
    }

    try {
      const updatedCard = await apiService.likeCard(cardId);
      setCards(cards.map(card => 
        card._id === cardId ? updatedCard : card
      ));
      toast.success('Carte likée !');
    } catch (error) {
      toast.error('Erreur lors du like');
    }
  };

  const filteredCards = cards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue sur Cardify
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Créez, gérez et partagez vos cartes de visite numériques professionnelles
        </p>
        {user ? (
          <Link to="/create-card">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première carte
            </Button>
          </Link>
        ) : (
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Se connecter</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher des cartes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Cartes récentes ({filteredCards.length})
        </h2>
        
        {filteredCards.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Aucune carte trouvée pour votre recherche' : 'Aucune carte disponible'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card key={card._id} hover className="group cursor-pointer">
                <div className="space-y-4">
                  {/* Card Image */}
                  {card.image && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={card.image.url}
                        alt={card.image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  
                  {/* Card Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {card.subtitle}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {card.likes.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(card._id);
                        }}
                        disabled={!user}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            user && card.likes.includes(user._id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                      <Link to={`/cards/${card._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
