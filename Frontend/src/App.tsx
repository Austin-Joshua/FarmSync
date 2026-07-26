// Main App component with routing
import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
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
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import CropCalendar from './pages/CropCalendar';
import FertilizerPesticide from './pages/FertilizerPesticide';
import History from './pages/History';
import Irrigation from './pages/Irrigation';
import MarketPrices from './pages/MarketPrices';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import UserPage from './pages/UserPage';
import YieldTracking from './pages/YieldTracking';
import Community from './pages/Community';
import Compliance from './pages/Compliance';
import Finance from './pages/Finance';
import IoTDashboard from './pages/IoTDashboard';
import PestPrediction from './pages/PestPrediction';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AIAssistant from './components/AIAssistant';
import { ThemeProvider } from './context/ThemeContext';
import CropRecommendation from './pages/CropRecommendation';
import Marketplace from './pages/Marketplace';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import StockManagement from './pages/StockManagement';
import NotFound from './pages/NotFound';

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
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <Layout>
                <MarketPrices />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/yield"
          element={
            <ProtectedRoute>
              <Layout>
                <YieldTracking />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <CropCalendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fertilizer"
          element={
            <ProtectedRoute>
              <Layout>
                <FertilizerPesticide />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/irrigation"
          element={
            <ProtectedRoute>
              <Layout>
                <Irrigation />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crop-recommend"
          element={
            <ProtectedRoute>
              <Layout>
                <CropRecommendation />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Layout>
                <Community />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <Layout>
                <Compliance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Layout>
                <Finance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/iot-dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <IoTDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pest-predict"
          element={
            <ProtectedRoute>
              <Layout>
                <PestPrediction />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Layout>
                <StockManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Layout>
                <Marketplace />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <Layout>
                <AboutUs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <Layout>
                <UserPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SessionTimeoutWarning />
      
      {/* 
        Conditionally hide AI Assistant on public pages (Landing, Login, Register, etc.)
        It will be visible in Dashboard and other protected areas.
      */}
      {!['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) && (
        <AIAssistant />
      )}
    </Suspense>
  );
};

function App() {

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppContent />
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
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
