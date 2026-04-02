// Main App component with routing
import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { cleanupAllCaches } from './utils/cacheCleanup';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CropManagement from './pages/CropManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import Settings from './pages/Settings';
import Fields from './pages/Fields';
import DiseaseDetection from './pages/DiseaseDetection';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AIAssistant from './components/AIAssistant';
import { ThemeProvider } from './context/ThemeContext';

// Component to handle document title updates
const AppContent = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Set document title to localized app name on every route change
  useEffect(() => {
    document.title = t('common.appName') || 'FarmSync';
  }, [location.pathname, t]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    }>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops"
          element={
            <ProtectedRoute>
              <Layout>
                <CropManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fields"
          element={
            <ProtectedRoute>
              <Layout>
                <Fields />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpenseManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-detect"
          element={
            <ProtectedRoute>
              <Layout>
                <DiseaseDetection />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SessionTimeoutWarning />
    </Suspense>
  );
};

function App() {
  // Cleanup caches and service workers on app load
  useEffect(() => {
    cleanupAllCaches().catch((error) => {
      console.warn('Cache cleanup failed:', error);
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <AppContent />
              <AIAssistant />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                }}
              />
            </BrowserRouter>
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
