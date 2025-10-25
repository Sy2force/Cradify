import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // En production, vous pourriez envoyer l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
          <div className="max-w-md w-full bg-white dark:bg-dark-100 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oups ! Une erreur s'est produite
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Une erreur inattendue s'est produite dans l'application. 
              Nous nous excusons pour la gêne occasionnée.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Détails de l'erreur (développement uniquement) :
                </h3>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={this.handleReload}
                variant="primary"
                className="w-full"
                leftIcon={<RefreshCw size={16} />}
              >
                Recharger la page
              </Button>

              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
                leftIcon={<Home size={16} />}
              >
                Retour à l'accueil
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Si le problème persiste, contactez le support technique.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version pour les composants fonctionnels
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
