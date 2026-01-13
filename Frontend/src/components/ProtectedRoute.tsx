// Protected Route component for authentication
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Helper function to check if user needs onboarding
const needsOnboarding = (user: any): boolean => {
  if (!user) return false;
  
  // Check if onboarding is already marked as complete
  if (localStorage.getItem('onboarding_complete') === 'true') {
    return false;
  }
  
  // For farmers, check if essential fields are missing
  if (user.role === 'farmer') {
    // User needs onboarding if location, land_size, or soil_type is missing
    return !user.location || !user.land_size || !user.soil_type;
  }
  
  // Admins don't need onboarding
  return false;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // useAuth now returns a default context instead of throwing
  const { isAuthenticated, user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Give auto-login a moment to complete
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500); // Reduced from 1000ms to 500ms

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Allow users to access dashboard and other pages without forcing onboarding
  // Users can complete profile details later in Settings if needed
  // Onboarding is now optional, not required

  return <>{children}</>;
};

export default ProtectedRoute;

