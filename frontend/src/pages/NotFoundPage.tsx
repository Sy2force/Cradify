import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <Search className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('notFound.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('notFound.message')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
{t('notFound.backHome')}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
{t('notFound.backPrevious')}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">
              {t('notFound.popularPages')}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cards')}
                className="text-xs"
              >
{t('notFound.myCards')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/create-card')}
                className="text-xs"
              >
{t('notFound.createCard')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-xs"
              >
{t('notFound.myProfile')}
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary-200 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-1/4 -right-8 w-12 h-12 bg-secondary-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 -left-6 w-6 h-6 bg-accent-200 rounded-full opacity-40 animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
}
