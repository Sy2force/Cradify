import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  centerScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '',
  centerScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 
        data-testid="loading-spinner"
        className={`${sizeClasses[size]} animate-spin text-primary-600`} 
      />
      {text && (
        <p className={`${textSizes[size]} text-gray-600 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (centerScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

// Composant de loading pour les pages complètes
export function PageLoader({ text }: { text?: string }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-96 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text || t('loading.default')} />
    </div>
  );
}

// Composant de loading inline
export function InlineLoader({ text }: { text?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text={text || t('loading.default')} />
    </div>
  );
}
