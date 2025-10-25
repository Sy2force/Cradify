import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Protected Route Component
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CardsPage = lazy(() => import('./pages/CardsPage'));
const MyCardsPage = lazy(() => import('./pages/MyCardsPage'));
const CreateCardPage = lazy(() => import('./pages/CreateCardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditCardPage = lazy(() => import('./pages/EditCardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Layout wrapper for pages with navbar and footer
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Layout wrapper for auth pages (no navbar/footer)
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200">
      <LoadingSpinner size="lg" text="Chargement..." />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
            <PerformanceMonitor />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth Routes (no layout) */}
                <Route path="/login" element={
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                } />
                <Route path="/register" element={
                  <AuthLayout>
                    <RegisterPage />
                  </AuthLayout>
                } />

              {/* Main Routes (with layout) */}
              <Route path="/" element={
                <Layout>
                  <HomePage />
                </Layout>
              } />
              
              <Route path="/cards" element={
                <Layout>
                  <CardsPage />
                </Layout>
              } />

              {/* Protected Routes */}
              <Route path="/my-cards" element={
                <Layout>
                  <ProtectedRoute requireAuth={true} requireBusiness={true}>
                    <MyCardsPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/create-card" element={
                <Layout>
                  <ProtectedRoute requireAuth={true} requireBusiness={true}>
                    <CreateCardPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/edit-card/:cardId" element={
                <Layout>
                  <ProtectedRoute requireAuth={true} requireBusiness={true}>
                    <EditCardPage />
                  </ProtectedRoute>
                </Layout>
              } />

              {/* Additional Routes */}
              <Route path="/profile" element={
                <Layout>
                  <ProtectedRoute requireAuth={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                </Layout>
              } />

              <Route path="/admin" element={
                <Layout>
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                </Layout>
              } />
              
              <Route path="/settings" element={
                <Layout>
                  <ProtectedRoute requireAuth={true}>
                    <SettingsPage />
                  </ProtectedRoute>
                </Layout>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <Layout>
                  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
                        404
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Page non trouvée
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        La page que vous recherchez n'existe pas
                      </p>
                      <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                </Layout>
              } />
            </Routes>
            </Suspense>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />

            {/* Global Styles for Toast */}
            <style>{`
              :root {
                --toast-bg: rgba(255, 255, 255, 0.9);
                --toast-color: #1f2937;
                --toast-border: rgba(229, 231, 235, 0.5);
              }
              
              [data-theme="dark"] {
                --toast-bg: rgba(31, 41, 55, 0.9);
                --toast-color: #f9fafb;
                --toast-border: rgba(75, 85, 99, 0.5);
              }
              
              .dark {
                --toast-bg: rgba(31, 41, 55, 0.9);
                --toast-color: #f9fafb;
                --toast-border: rgba(75, 85, 99, 0.5);
              }
            `}</style>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}
