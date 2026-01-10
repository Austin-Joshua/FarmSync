// Admin Protected Route component - Only allows admin access
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give auto-login a moment to complete
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
