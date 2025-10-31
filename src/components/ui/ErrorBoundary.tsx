import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-96 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Une erreur s'est produite
            </h2>
            
            <p className="text-gray-600 mb-6">
              Désolé, quelque chose s'est mal passé. Essayez de rafraîchir la page ou contactez le support si le problème persiste.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                className="flex items-center justify-center mx-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="flex items-center justify-center mx-auto"
              >
                Rafraîchir la page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
