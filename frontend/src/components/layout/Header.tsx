import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Menu,
  X,
  Moon,
  Sun,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Cartes', href: '/cards' },
    ...(user?.isBusiness ? [{ name: 'Mes Cartes', href: '/my-cards' }] : []),
    ...(user?.isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  return (
    <header className={cn(
      'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Cardify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              title="Changer le thème"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center space-x-4">
                  {user.isBusiness && (
                    <Button
                      as={Link}
                      to="/cards/create"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Créer</span>
                    </Button>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <img
                      src={user.image?.url || 'https://via.placeholder.com/32'}
                      alt={user.image?.alt || 'Avatar'}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {user.name.first} {user.name.last}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      as={Link}
                      to="/profile"
                      variant="ghost"
                      size="sm"
                      title="Profil"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      title="Déconnexion"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              /* Auth Buttons */
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  as={Link}
                  to="/login"
                  variant="ghost"
                  size="sm"
                >
                  Connexion
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  size="sm"
                >
                  Inscription
                </Button>
              </div>
            )}

            {/* Mobile Menu Button (when not logged in) */}
            {!user && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 px-4 mb-4">
                  <img
                    src={user.image?.url || 'https://via.placeholder.com/40'}
                    alt={user.image?.alt || 'Avatar'}
                    className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name.first} {user.name.last}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {user.isBusiness && (
                    <Link
                      to="/cards/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Créer une carte</span>
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Profil</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2 w-full text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
