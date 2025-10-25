import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, usePermissions } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireBusiness?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireBusiness = false,
  requireAdmin = false,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isLoading } = useAuth();
  const { isAuthenticated, isBusiness, isAdmin } = usePermissions();
  const location = useLocation();

  // Empêcher l'utilisateur de quitter l'espace sans déconnexion
  useEffect(() => {
    if (isAuthenticated && requireAuth) {
      const handleUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Êtes-vous sûr de vouloir quitter ? Utilisez le bouton de déconnexion pour vous déconnecter en toute sécurité.';
        return e.returnValue;
      };

      const handlePopState = (e: PopStateEvent) => {
        const confirmLeave = window.confirm(
          'Êtes-vous sûr de vouloir quitter ? Utilisez le bouton de déconnexion pour vous déconnecter en toute sécurité.'
        );
        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, '', location.pathname);
        }
      };

      // Ajouter les écouteurs d'événements pour empêcher la sortie non autorisée
      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Pousser un état dans l'historique pour détecter les tentatives de retour
      window.history.pushState(null, '', location.pathname);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
    return undefined;
  }, [isAuthenticated, requireAuth, location.pathname]);

  // Affichage du loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex-center bg-gray-50 dark:bg-dark-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Vérification de l'authentification requise
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location,
          message: 'Vous devez être connecté pour accéder à cette page.'
        }} 
        replace 
      />
    );
  }

  // Vérification des permissions business
  if (requireBusiness && !isBusiness && !isAdmin) {
    return (
      <Navigate 
        to="/" 
        state={{ 
          message: 'Accès refusé. Compte business requis.'
        }} 
        replace 
      />
    );
  }

  // Vérification des permissions admin
  if (requireAdmin && !isAdmin) {
    return (
      <Navigate 
        to="/" 
        state={{ 
          message: 'Accès refusé. Permissions administrateur requises.'
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
}
