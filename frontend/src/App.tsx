import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const CardsPage = React.lazy(() => import('./pages/CardsPage').then(module => ({ default: module.CardsPage })));
const CreateCardPage = React.lazy(() => import('./pages/CreateCardPage').then(module => ({ default: module.CreateCardPage })));
const EditCardPage = React.lazy(() => import('./pages/EditCardPage').then(module => ({ default: module.EditCardPage })));
const CardDetailPage = React.lazy(() => import('./pages/CardDetailPage').then(module => ({ default: module.CardDetailPage })));
const StatsPage = React.lazy(() => import('./pages/StatsPage').then(module => ({ default: module.StatsPage })));
const ExportImportPage = React.lazy(() => import('./pages/ExportImportPage').then(module => ({ default: module.ExportImportPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

function AppContent() {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/cards/create" element={<CreateCardPage />} />
          <Route path="/cards/edit/:id" element={<EditCardPage />} />
          <Route path="/cards/:id" element={<CardDetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/export-import" element={<ExportImportPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <div className="w-full min-h-screen">
      <ErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <AppContent />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  )
}

export default App
