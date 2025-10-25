import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  CreditCard,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  AlertTriangle,
  Shield,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, cardService } from '@/services/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageProps, User, Card } from '@/types';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  activeUsers: number;
  businessUsers: number;
}

export default function AdminPage({ className }: PageProps = {}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCards: 0,
    activeUsers: 0,
    businessUsers: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'cards'>('users');

  // Redirect if not admin
  useEffect(() => {
    if (user && (user.role !== 'admin' && !user.isAdmin)) {
      window.location.href = '/cards';
      return;
    }
  }, [user]);

  // Load admin data
  useEffect(() => {
    if (user && (user.role === 'admin' || user.isAdmin)) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [usersData, cardsData] = await Promise.all([
        userService.getAllUsers(),
        cardService.getAllCards(),
      ]);

      setUsers(usersData);
      setCards(cardsData);

      // Calculate stats
      setStats({
        totalUsers: usersData.length,
        totalCards: cardsData.length,
        activeUsers: usersData.filter(u => u.status === 'active' || !u.status).length,
        businessUsers: usersData.filter(u => u.isBusiness).length,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await userService.toggleBusinessStatus(userId);
      
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, status: newStatus as 'active' | 'suspended' } : u
      ));
      
      toast.success(`Utilisateur ${newStatus === 'active' ? 'activé' : 'suspendu'} avec succès`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    try {
      await cardService.deleteCard(cardId);
      setCards(prev => prev.filter(c => c._id !== cardId));
      toast.success('Carte supprimée avec succès');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.first.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.last.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof card.user_id === 'object' && card.user_id.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user || (user.role !== 'admin' && !user.isAdmin)) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accès Refusé
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center ${className || ''}`}>
        <LoadingSpinner size="lg" text="Chargement du panel admin..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 py-8 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Panel Administrateur
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gérez les utilisateurs et les cartes de la plateforme
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Cartes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCards}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Comptes Business</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.businessUsers}</p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 dark:bg-dark-100/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-dark-300/50"
        >
          {/* Tabs and Search */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Utilisateurs ({stats.totalUsers})
                </button>
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'cards'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Cartes ({stats.totalCards})
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Rechercher ${activeTab === 'users' ? 'des utilisateurs' : 'des cartes'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'users' ? (
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.first[0]}{user.name.last[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {user.name.first} {user.name.last}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.status === 'active' || !user.status
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {user.status === 'active' || !user.status ? 'Actif' : 'Suspendu'}
                            </span>
                            {user.isBusiness && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                Business
                              </span>
                            )}
                            {(user.role === 'admin' || user.isAdmin) && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user._id, user.status || 'active')}
                          leftIcon={user.status === 'active' || !user.status ? <UserX /> : <UserCheck />}
                        >
                          {user.status === 'active' || !user.status ? 'Suspendre' : 'Activer'}
                        </Button>
                        {user.role !== 'admin' && !user.isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            leftIcon={<Trash2 />}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCards.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Aucune carte trouvée</p>
                  </div>
                ) : (
                  filteredCards.map((card) => (
                    <div key={card._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{card.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{card.subtitle}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Créé par: {typeof card.user_id === 'object' 
                              ? `${card.user_id.name.first} ${card.user_id.name.last}` 
                              : 'Utilisateur inconnu'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {card.likes?.length || 0} j'aime
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye />}
                          onClick={() => window.open(`/card/${card._id}`, '_blank')}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCard(card._id)}
                          leftIcon={<Trash2 />}
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
