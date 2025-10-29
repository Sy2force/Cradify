import { useState, useEffect, useCallback } from 'react';
import { Users, UserCheck, TrendingUp, Search, UserX, Shield, CreditCard, CheckCircle, XCircle, Ban, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/ui/Button';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}

interface User {
  _id: string;
  name: { first: string; last: string };
  email: string;
  isBusiness: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  cardsCount: number;
  isAdmin?: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  businessUsers: number;
  totalCards: number;
  recentSignups: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

type ActivityType = 'user_created' | 'card_created' | 'login' | 'admin_action';
type SeverityLevel = 'low' | 'medium' | 'high';

interface ActivityLog {
  id: string;
  type: ActivityType;
  user: string;
  description: string;
  timestamp: string;
  severity: SeverityLevel;
}

// Constants définies en dehors du composant pour éviter la re-création
const ACTIVITY_TYPES: ActivityType[] = ['user_created', 'card_created', 'login', 'admin_action'];
const SEVERITY_LEVELS: SeverityLevel[] = ['low', 'medium', 'high'];
const getActivityDescriptions = (t: (key: string) => string) => [
  t('admin.newUserCreated'),
  t('admin.newCardCreated'), 
  t('admin.userLogin'),
  t('admin.adminAction')
];

export function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const loadAdminData = useCallback(async () => {
    if (!user?.isAdmin) {
      return;
    }

    try {
      setLoading(true);
      
      // Simuler des données d'administration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
        _id: `user_${i + 1}`,
        name: { 
          first: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'][i % 7],
          last: ['Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand'][i % 7]
        },
        email: `user${i + 1}@example.com`,
        isBusiness: Math.random() > 0.7,
        isActive: Math.random() > 0.1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        cardsCount: Math.floor(Math.random() * 10),
        isAdmin: i === 0
      }));

      const mockStats: AdminStats = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.isActive).length,
        businessUsers: mockUsers.filter(u => u.isBusiness).length,
        totalCards: mockUsers.reduce((acc, u) => acc + u.cardsCount, 0),
        recentSignups: mockUsers.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        systemHealth: 'good'
      };

      const mockActivityLogs: ActivityLog[] = Array.from({ length: 50 }, (_, i) => {
        const typeIndex = Math.floor(Math.random() * ACTIVITY_TYPES.length);
        return {
          id: `log_${i + 1}`,
          type: ACTIVITY_TYPES[typeIndex],
          user: mockUsers[Math.floor(Math.random() * mockUsers.length)].email,
          description: getActivityDescriptions(t)[Math.floor(Math.random() * getActivityDescriptions(t).length)],
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          severity: SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)]
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setUsers(mockUsers);
      setStats(mockStats);
      setActivityLogs(mockActivityLogs.slice(0, 20));
      
    } catch {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les données d\'administration'
      });
    } finally {
      setLoading(false);
    }
  }, [user, t, addNotification]);  

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      // Simuler l'action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId 
            ? { ...u, isActive: action === 'activate' ? true : action === 'deactivate' ? false : u.isActive }
            : u
        ).filter(u => action !== 'delete' || u._id !== userId)
      );

      addNotification({
        type: 'success',
        title: 'Action effectuée',
        message: `Utilisateur ${action === 'activate' ? 'activé' : action === 'deactivate' ? 'désactivé' : 'supprimé'} avec succès`
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'effectuer cette action'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.first.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.last.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.accessDenied')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('admin.adminOnly')}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            {t('admin.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('admin.subtitle')}
          </p>
        </div>

        {/* Statistiques principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.totalUsers')}</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('admin.userManagement')}</h2>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.activeUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.totalCards')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCards}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.recentSignups')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentSignups}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gestion des utilisateurs */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gestion des Utilisateurs
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => loadAdminData()}
                >
                  {t('admin.refresh')}
                </Button>
              </div>

              {/* Filtres et recherche */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('admin.searchUsers')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrer les utilisateurs par statut"
                >
                  <option value="all">{t('admin.allUsers')}</option>
                  <option value="active">{t('admin.activeOnly')}</option>
                  <option value="inactive">{t('admin.inactiveOnly')}</option>
                </select>
              </div>

              {/* Liste des utilisateurs */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3">{t('admin.user')}</th>
                      <th className="px-4 py-3">{t('admin.type')}</th>
                      <th className="px-4 py-3">{t('admin.status')}</th>
                      <th className="px-4 py-3">{t('admin.cards')}</th>
                      <th className="px-4 py-3">{t('admin.lastLogin')}</th>
                      <th className="px-4 py-3">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 10).map((user) => (
                      <tr key={user._id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                              {user.name.first.charAt(0)}{user.name.last.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.name.first} {user.name.last}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {user.isBusiness ? t('admin.business') : t('admin.personal')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.isActive ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                {t('admin.active')}
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                                {t('admin.inactive')}
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {user.cardsCount}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('admin.never')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {user.isAdmin && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mr-2">
                                <Shield className="w-3 h-3 mr-1" />
                                {t('admin.admin')}
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user._id, 'delete')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Journal d'activité */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {t('admin.activityLog')}
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityLogs.length > 0 ? activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className={`p-1.5 rounded-full ${
                      log.severity === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      log.severity === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.user}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('admin.noActivity')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
