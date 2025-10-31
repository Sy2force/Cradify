import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Plus, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../ui/NotificationBell';

export function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Cardify</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              {t('nav.home')}
            </Link>
            {user && (
              <>
                <Link
                  to="/cards"
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.cards')}
                </Link>
                <Link
                  to="/create-card"
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.createCard')}
                </Link>
                <Link
                  to="/stats"
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.stats')}
                </Link>
                <Link
                  to="/analytics"
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.analytics')}
                </Link>
                <Link
                  to="/export-import"
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.exportImport')}
                </Link>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <LanguageToggle />
            {user && <NotificationBell />}
            
            {user ? (
              <>
                {/* User Avatar and Name */}
                <div className="flex items-center space-x-3 hidden md:flex">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {user.image?.url ? (
                      <img 
                        src={user.image.url} 
                        alt={user.image.alt || `${user.name.first} ${user.name.last}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {user.name.first.charAt(0)}{user.name.last.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name.first} {user.name.last}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.isBusiness ? t('account.business') : t('account.personal')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/create-card')}
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg backdrop-blur-sm bg-primary-600/90 hover:bg-primary-700/90 border border-primary-500/50 hover:border-primary-400/50 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('nav.newCard')}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  title={t('nav.profile')}
                  className="p-2 text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/40 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  title={t('nav.logout')}
                  className="p-2 text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-red-50/50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg backdrop-blur-sm bg-primary-600/90 hover:bg-primary-700/90 border border-primary-500/50 hover:border-primary-400/50 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  {t('nav.register')}
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              {user && (
                <>
                  <Link
                    to="/cards"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.cards')}
                  </Link>
                  <Link
                    to="/create-card"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.createCard')}
                  </Link>
                  <Link
                    to="/stats"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📊 {t('nav.stats')}
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📈 {t('nav.analytics')}
                  </Link>
                  <Link
                    to="/export-import"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📤 {t('nav.exportImport')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
