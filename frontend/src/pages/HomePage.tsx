import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Eye, Search, Briefcase, Users, Star, Zap, Shield, Globe, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../lib/api';
import { Card as CardType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
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
    <div className="min-h-screen">
      {/* Hero Section Immersive */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse [animation-delay:2s]"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse [animation-delay:4s]"></div>
        </div>
        
        <div className="relative z-10 px-6 py-24 mx-auto max-w-7xl lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-bounce">
              <Sparkles className="w-4 h-4 mr-2" />
              Plateforme N°1 des cartes de visite digitales
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Révolutionnez vos
              <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                Cartes de Visite
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Créez, partagez et gérez vos cartes de visite numériques avec style. 
              Une expérience professionnelle moderne qui impressionne vos contacts.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <Link to="/create-card">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Plus className="w-6 h-6 mr-2" />
                    Créer ma carte magique
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                      <Zap className="w-6 h-6 mr-2" />
                      Commencer gratuitement
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300">
                      Se connecter
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-gray-300">Cartes créées</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-gray-300">Satisfaction client</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-300">Support disponible</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir Cardify ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les fonctionnalités qui font de Cardify la plateforme de référence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Création Instantanée</h3>
              <p className="text-gray-600 leading-relaxed">Créez vos cartes en quelques clics avec notre interface intuitive et nos templates professionnels.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sécurité Garantie</h3>
              <p className="text-gray-600 leading-relaxed">Vos données sont protégées avec un chiffrement de niveau bancaire et une conformité RGPD.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Partage Global</h3>
              <p className="text-gray-600 leading-relaxed">Partagez instantanément vos cartes via QR code, email, ou réseaux sociaux partout dans le monde.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Avancés</h3>
              <p className="text-gray-600 leading-relaxed">Suivez les vues, les interactions et optimisez l'impact de vos cartes avec des statistiques détaillées.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">Travaillez en équipe, gérez les accès et créez des cartes cohérentes pour votre organisation.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Templates Premium</h3>
              <p className="text-gray-600 leading-relaxed">Accédez à plus de 100 templates professionnels conçus par des designers experts.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Catégories de Cartes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Explorez notre collection de templates par secteur d'activité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Business */}
            <Link to="/cards?category=business" className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <Briefcase className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-2">Business</h3>
                <p className="text-blue-100 mb-4">Cartes professionnelles élégantes</p>
                <div className="text-sm font-medium">150+ templates →</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>
            
            {/* Creative */}
            <Link to="/cards?category=creative" className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-700 p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <Sparkles className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-2">Créatif</h3>
                <p className="text-purple-100 mb-4">Designs artistiques et originaux</p>
                <div className="text-sm font-medium">85+ templates →</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>
            
            {/* Tech */}
            <Link to="/cards?category=tech" className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-teal-700 p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <Zap className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-2">Tech</h3>
                <p className="text-green-100 mb-4">Moderne et innovant</p>
                <div className="text-sm font-medium">120+ templates →</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>
            
            {/* Personal */}
            <Link to="/cards?category=personal" className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 p-8 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <Users className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-2">Personnel</h3>
                <p className="text-orange-100 mb-4">Cartes personnelles uniques</p>
                <div className="text-sm font-medium">95+ templates →</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Découvrez les créations de notre communauté
          </h2>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="Rechercher par nom, secteur, style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Cartes de la Communauté
              </h2>
              <p className="text-gray-600">
                Découvrez {filteredCards.length} créations inspirantes
              </p>
            </div>
            <Link to="/cards">
              <Button variant="outline" size="lg" className="hidden sm:flex">
                Voir toutes les cartes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {filteredCards.length === 0 ? (
            <Card className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm ? 'Aucun résultat' : 'Prêt à commencer ?'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {searchTerm 
                    ? 'Essayez avec d\'autres mots-clés ou explorez nos catégories' 
                    : 'Créez votre première carte de visite et rejoignez la communauté'}
                </p>
                {!user && (
                  <Link to="/register">
                    <Button size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Commencer maintenant
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCards.slice(0, 8).map((card) => (
                <Card key={card._id} className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 bg-white">
                  <div className="relative">
                    {/* Card Image */}
                    {card.image ? (
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                        <img
                          src={card.image.url}
                          alt={card.image.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Briefcase className="w-12 h-12 text-white opacity-50" />
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link to={`/cards/${card._id}`}>
                          <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
                            <Eye className="w-4 h-4 mr-1" />
                            Voir la carte
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Like button */}
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 border-0"
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
                              : 'text-gray-600'
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mb-2">
                      {card.subtitle}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                    
                    {/* Card Stats */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="font-medium">{card.likes.length}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Carte #{card._id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Show more button */}
          {filteredCards.length > 8 && (
            <div className="text-center mt-16">
              <Link to="/cards">
                <Button size="lg" variant="outline" className="px-8">
                  Voir les {filteredCards.length - 8} autres cartes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à créer votre carte parfaite ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez plus de 50 000 professionnels qui utilisent Cardify pour impressionner leurs contacts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/create-card">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl">
                  <Plus className="w-6 h-6 mr-2" />
                  Créer ma carte maintenant
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl">
                    <Zap className="w-6 h-6 mr-2" />
                    Essai gratuit - 30 jours
                  </Button>
                </Link>
                <Link to="/cards">
                  <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-xl">
                    Explorer les exemples
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
