import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Heart,
  Calendar,
  Activity,
  Target,
  Eye,
  Clock
} from 'lucide-react';
import '../styles/analytics.css';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface AnalyticsData {
  cardViews: {
    total: number;
    byCard: Array<{ cardId: string; title: string; views: number }>;
    byDate: Array<{ date: string; views: number }>;
  };
  engagement: {
    totalLikes: number;
    totalShares: number;
    avgEngagementRate: number;
    topEngagingCards: Array<{ cardId: string; title: string; engagement: number }>;
  };
  performance: {
    conversionRate: number;
    clickThroughRate: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    popularTimes: Array<{ hour: number; activity: number }>;
  };
}

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Simuler des données d'analytics réalistes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAnalytics: AnalyticsData = {
        cardViews: {
          total: Math.floor(Math.random() * 5000) + 1000,
          byCard: [
            { cardId: '1', title: 'Carte Business Pro', views: Math.floor(Math.random() * 500) + 100 },
            { cardId: '2', title: 'Carte Créative', views: Math.floor(Math.random() * 400) + 80 },
            { cardId: '3', title: 'Carte Tech', views: Math.floor(Math.random() * 300) + 60 },
            { cardId: '4', title: 'Carte Personnel', views: Math.floor(Math.random() * 200) + 40 }
          ],
          byDate: Array.from({ length: parseInt(timeRange) }, (_, i) => ({
            date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100) + 20
          })).reverse()
        },
        engagement: {
          totalLikes: Math.floor(Math.random() * 1000) + 200,
          totalShares: Math.floor(Math.random() * 500) + 100,
          avgEngagementRate: Math.random() * 0.15 + 0.05,
          topEngagingCards: [
            { cardId: '1', title: 'Carte Business Pro', engagement: Math.random() * 0.3 + 0.1 },
            { cardId: '2', title: 'Carte Créative', engagement: Math.random() * 0.25 + 0.08 }
          ]
        },
        performance: {
          conversionRate: Math.random() * 0.1 + 0.02,
          clickThroughRate: Math.random() * 0.08 + 0.01,
          bounceRate: Math.random() * 0.4 + 0.3,
          avgSessionDuration: Math.floor(Math.random() * 300) + 120
        },
        trends: {
          weeklyGrowth: (Math.random() - 0.5) * 0.4,
          monthlyGrowth: (Math.random() - 0.3) * 0.6,
          popularTimes: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            activity: Math.random() * 100
          }))
        }
      };

      setAnalytics(mockAnalytics);
    } catch {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les analytics'
      });
    } finally {
      setLoading(false);
    }
  }, [user, timeRange, addNotification]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.floor(num));
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aucune donnée disponible</h2>
          <p className="text-gray-600 dark:text-gray-300">Les analytics apparaîtront une fois que vous aurez des cartes actives.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Avancées
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Analyses détaillées de vos performances
              </p>
            </div>
            
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analytics.cardViews.total)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">
                {formatPercentage(Math.abs(analytics.trends.weeklyGrowth))} cette semaine
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(analytics.engagement.avgEngagementRate)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {formatNumber(analytics.engagement.totalLikes)} likes
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de conversion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(analytics.performance.conversionRate)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                CTR: {formatPercentage(analytics.performance.clickThroughRate)}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Session moyenne</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(analytics.performance.avgSessionDuration)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Rebond: {formatPercentage(analytics.performance.bounceRate)}
              </span>
            </div>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top cartes par vues */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Top Cartes par Vues
            </h3>
            <div className="space-y-4">
              {analytics.cardViews.byCard.map((card, index) => (
                <div key={card.cardId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{card.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{formatNumber(card.views)}</div>
                    <div className="text-xs text-gray-500">vues</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement par carte */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
              Engagement par Carte
            </h3>
            <div className="space-y-4">
              {analytics.engagement.topEngagingCards.map((card, index) => (
                <div key={card.cardId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{card.title}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {formatPercentage(card.engagement)}
                    </div>
                    <div className="text-xs text-gray-500">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heures populaires */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Heures d'Activité Populaires
          </h3>
          <div className="grid grid-cols-12 gap-2">
            {analytics.trends.popularTimes.map((time) => (
              <div key={time.hour} className="text-center">
                <div 
                  className="activity-bar"
                  data-height={Math.max(time.activity / 2, 10)}
                ></div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {time.hour}h
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Pic d'activité entre 14h et 18h
          </div>
        </div>

        {/* Insights et recommandations */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Insights & Recommandations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">📈 Performance</h4>
              <p className="text-sm opacity-90">
                Vos cartes ont une croissance de {formatPercentage(Math.abs(analytics.trends.monthlyGrowth))} ce mois. 
                Continuez à optimiser le contenu !
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">⏰ Timing optimal</h4>
              <p className="text-sm opacity-90">
                Publiez entre 14h-18h pour maximiser l'engagement de votre audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
