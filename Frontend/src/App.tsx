// Main App component with routing
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CropManagement from './pages/CropManagement';
import FertilizerPesticide from './pages/FertilizerPesticide';
import Irrigation from './pages/Irrigation';
import ExpenseManagement from './pages/ExpenseManagement';
import YieldTracking from './pages/YieldTracking';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';
import UserPage from './pages/UserPage';
import CropCalendar from './pages/CropCalendar';
import MarketPrices from './pages/MarketPrices';
import Fields from './pages/Fields';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import { useEffect } from 'react';
import { initializeServiceWorker } from './utils/serviceWorkerRegistration';

// Component to handle document title updates
const AppContent = () => {
  const location = useLocation();

  // Set document title to FarmSync on every route change
  useEffect(() => {
    document.title = 'FarmSync';
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
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
        path="/fertilizers"
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
        path="/user"
        element={
          <ProtectedRoute>
            <Layout>
              <UserPage />
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
        path="/market-prices"
        element={
          <ProtectedRoute>
            <Layout>
              <MarketPrices />
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
      {/* Admin Only Routes */}
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

      {/* Default redirect - will auto-login if not authenticated */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  // Register service worker on app load
  useEffect(() => {
    initializeServiceWorker();
  }, []);

  // Set initial document title to FarmSync
  useEffect(() => {
    document.title = 'FarmSync';
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <SessionTimeoutWarning />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
