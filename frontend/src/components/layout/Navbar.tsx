import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Plus, 
  CreditCard, 
  Settings,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, formatFullName, getAvatarUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const themes: Array<typeof theme> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setTheme(nextTheme);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-50/80 backdrop-blur-md border-b border-gray-200/50 dark:border-dark-300/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Cardify
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400',
                isActive('/') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              Accueil
            </Link>
            
            <Link
              to="/cards"
              className={cn(
                'text-sm font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400',
                isActive('/cards') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              Découvrir
            </Link>

            {user && (
              <>
                <Link
                  to="/my-cards"
                  className={cn(
                    'text-sm font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400',
                    isActive('/my-cards') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  Mes Cartes
                </Link>

                {user.isBusiness && (
                  <Link
                    to="/create-card"
                    className={cn(
                      'text-sm font-medium transition-colors duration-200 hover:text-primary-600 dark:hover:text-primary-400',
                      isActive('/create-card') 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-300'
                    )}
                  >
                    Créer
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              title={`Thème: ${theme}`}
              aria-label={`Changer le thème (actuellement ${theme})`}
            >
              <ThemeIcon size={20} />
            </motion.button>

            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                  title="Menu utilisateur"
                  aria-label={`Menu utilisateur pour ${formatFullName(user.name)}`}
                  aria-expanded={isUserMenuOpen}
                >
                  <img
                    src={user.image?.url || getAvatarUrl(user.name)}
                    alt={formatFullName(user.name)}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name.first}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-100 rounded-xl shadow-lg border border-gray-200 dark:border-dark-300 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-300">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatFullName(user.name)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                        {user.isBusiness && (
                          <span className="inline-block px-2 py-0.5 mt-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                            Business
                          </span>
                        )}
                        {(user.role === 'admin' || user.isAdmin) && (
                          <span className="inline-block px-2 py-0.5 mt-1 ml-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Mon Profil</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Paramètres</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle Mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cycleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              title={`Thème: ${theme}`}
              aria-label={`Changer le thème (actuellement ${theme})`}
            >
              <ThemeIcon size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
              title={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-label={isMobileMenuOpen ? 'Fermer le menu mobile' : 'Ouvrir le menu mobile'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-dark-50/95 backdrop-blur-sm border-b border-gray-200 dark:border-dark-300"
          >
            <div className="px-4 py-4 space-y-4">
              {/* User Info (Mobile) */}
              {user && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                  <img
                    src={user.image?.url || getAvatarUrl(user.name)}
                    alt={formatFullName(user.name)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatFullName(user.name)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive('/') 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200'
                  )}
                >
                  Accueil
                </Link>
                
                <Link
                  to="/cards"
                  onClick={closeMobileMenu}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive('/cards') 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200'
                  )}
                >
                  Découvrir
                </Link>

                {user && (
                  <>
                    <Link
                      to="/my-cards"
                      onClick={closeMobileMenu}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive('/my-cards') 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200'
                      )}
                    >
                      Mes Cartes
                    </Link>

                    {user.isBusiness && (
                      <Link
                        to="/create-card"
                        onClick={closeMobileMenu}
                        className={cn(
                          'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive('/create-card') 
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200'
                        )}
                      >
                        <Plus size={16} />
                        <span>Créer une Carte</span>
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Auth Buttons (Mobile) */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 dark:border-dark-300">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-dark-300">
                  <Link to="/login" className="flex-1" onClick={closeMobileMenu}>
                    <Button variant="outline" size="sm" fullWidth>
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={closeMobileMenu}>
                    <Button size="sm" fullWidth>
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menus */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
