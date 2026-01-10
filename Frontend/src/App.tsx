// Main App component with routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropManagement from './pages/CropManagement';
import FertilizerPesticide from './pages/FertilizerPesticide';
import Irrigation from './pages/Irrigation';
import ExpenseManagement from './pages/ExpenseManagement';
import YieldTracking from './pages/YieldTracking';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
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
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect - will auto-login if not authenticated */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
