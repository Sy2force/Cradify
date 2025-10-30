/**
 * 🛡️ Error Boundary Avancé - Cardify
 * Auteur: Shaya Coca
 * Description: Composant Error Boundary avec monitoring et récupération automatique
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { monitoring } from '../utils/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRecovery?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, maxRetries = 3 } = this.props;
    
    // Capturer l'erreur avec le système de monitoring
    monitoring.captureError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.state.retryCount
      }
    });

    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Callback personnalisé
    onError?.(error, errorInfo);

    // Tentative de récupération automatique
    if (this.props.enableRecovery && this.state.retryCount < maxRetries) {
      this.scheduleRecovery();
    }
  }

  private scheduleRecovery = () => {
    this.setState({ isRecovering: true });
    
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false
      });
    }, 2000 + this.state.retryCount * 1000); // Délai progressif
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Ouvrir un email ou rediriger vers un formulaire de bug
    const subject = encodeURIComponent('Bug Report - Cardify');
    const body = encodeURIComponent(`
Erreur détectée dans Cardify:

${JSON.stringify(bugReport, null, 2)}

Veuillez décrire ce que vous faisiez quand l'erreur s'est produite:
[Votre description ici]
    `);
    
    window.open(`mailto:support@cardify.com?subject=${subject}&body=${body}`);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    const { hasError, error, isRecovering, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      // Fallback personnalisé
      if (fallback) {
        return fallback;
      }

      // Interface de récupération automatique
      if (isRecovering) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
              <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Récupération en cours...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tentative {retryCount} sur {maxRetries}
              </p>
            </div>
          </div>
        );
      }

      // Interface d'erreur complète
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Oups ! Une erreur s'est produite
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Nous nous excusons pour ce désagrément. L'erreur a été automatiquement signalée.
              </p>
            </div>

            {/* Détails de l'erreur (en développement) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Détails de l'erreur (dev):
                </h3>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
                  {error.message}
                </pre>
              </div>
            )}

            {/* Informations sur les tentatives */}
            {retryCount > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {retryCount >= maxRetries 
                    ? `Échec après ${maxRetries} tentatives de récupération automatique.`
                    : `Tentative de récupération ${retryCount}/${maxRetries} échouée.`
                  }
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleManualRetry}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Bug className="w-4 h-4 mr-2" />
                Signaler le problème
              </button>
            </div>

            {/* Conseils */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Que puis-je faire ?
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Actualisez la page (F5)</li>
                <li>• Vérifiez votre connexion internet</li>
                <li>• Essayez de vider le cache du navigateur</li>
                <li>• Contactez le support si le problème persiste</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC pour wrapper automatiquement les composants avec ErrorBoundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
