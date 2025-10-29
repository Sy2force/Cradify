import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Heart,
  BarChart3,
  Eye,
  Star
} from 'lucide-react';

interface GlobalStats {
  users: {
    total: number;
    business: number;
    personal: number;
  };
  cards: {
    total: number;
    thisMonth: number;
    totalLikes: number;
  };
  engagement: {
    averageLikesPerCard: number;
    cardsPerUser: number;
  };
}

interface UserStats {
  cards: {
    total: number;
    totalLikes: number;
    totalViews: number;
    averageLikes: number;
  };
  recentCards: Array<{
    id: string;
    title: string;
    likes: number;
    createdAt: string;
  }>;
}

interface TrendingCard {
  id: string;
  title: string;
  subtitle: string;
  likes: number;
  createdAt: string;
  author: {
    name: string;
    image?: string;
  };
}

export function StatsPage() {
  const { user } = useAuth();
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [trending, setTrending] = useState<TrendingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [globalResponse, trendingResponse, userResponse] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/stats/trending').then(r => r.json()),
        user ? fetch('/api/stats/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('cardify_token')}`
          }
        }).then(r => r.json()) : Promise.resolve(null)
      ]);

      if (globalResponse.success) {
        setGlobalStats(globalResponse.data);
      }
      
      if (trendingResponse.success) {
        setTrending(trendingResponse.data);
      }

      if (userResponse?.success) {
        setUserStats(userResponse.data);
      }
    } catch {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📊 Statistiques Cardify
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Découvrez les métriques et tendances de la communauté
          </p>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Statistiques Globales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10" />
                  <div>
                    <p className="text-blue-100">Utilisateurs Total</p>
                    <p className="text-3xl font-bold">{globalStats.users.total}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-10 h-10" />
                  <div>
                    <p className="text-green-100">Cartes Créées</p>
                    <p className="text-3xl font-bold">{globalStats.cards.total}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center gap-4">
                  <Heart className="w-10 h-10" />
                  <div>
                    <p className="text-purple-100">Likes Total</p>
                    <p className="text-3xl font-bold">{globalStats.cards.totalLikes}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-10 h-10" />
                  <div>
                    <p className="text-orange-100">Cartes/Utilisateur</p>
                    <p className="text-3xl font-bold">{globalStats.engagement.cardsPerUser}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Répartition des Utilisateurs
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Business</span>
                    <span className="font-bold text-blue-600">{globalStats.users.business}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Personnel</span>
                    <span className="font-bold text-green-600">{globalStats.users.personal}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Activité ce Mois
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Nouvelles cartes</span>
                    <span className="font-bold text-purple-600">{globalStats.cards.thisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Likes moyen/carte</span>
                    <span className="font-bold text-orange-600">{globalStats.engagement.averageLikesPerCard}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* User Personal Stats */}
        {user && userStats && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Vos Statistiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-10 h-10" />
                  <div>
                    <p className="text-cyan-100">Mes Cartes</p>
                    <p className="text-3xl font-bold">{userStats.cards.total}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <div className="flex items-center gap-4">
                  <Heart className="w-10 h-10" />
                  <div>
                    <p className="text-pink-100">Likes Reçus</p>
                    <p className="text-3xl font-bold">{userStats.cards.totalLikes}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <div className="flex items-center gap-4">
                  <Eye className="w-10 h-10" />
                  <div>
                    <p className="text-indigo-100">Vues Total</p>
                    <p className="text-3xl font-bold">{userStats.cards.totalViews}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-10 h-10" />
                  <div>
                    <p className="text-teal-100">Likes Moyen</p>
                    <p className="text-3xl font-bold">{userStats.cards.averageLikes}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Cards */}
            {userStats.recentCards.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Vos Cartes Récentes
                </h3>
                <div className="space-y-3">
                  {userStats.recentCards.map((card) => (
                    <div
                      key={card.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{card.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(card.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-pink-600">
                        <Heart className="w-4 h-4" />
                        <span className="font-medium">{card.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Trending Cards */}
        {trending.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-500" />
              Cartes Tendances (7 derniers jours)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map((card, index) => (
                <Card key={card.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {card.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-500 font-bold">
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>Par {card.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-pink-600">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{card.likes}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Créée le {new Date(card.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={loadStats}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            🔄 Actualiser les Statistiques
          </button>
        </div>
      </div>
    </div>
  );
}
