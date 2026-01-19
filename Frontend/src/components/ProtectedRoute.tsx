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
  const location = useLocation();

  // Check authentication immediately - no artificial delay
  // AuthContext initializes synchronously from localStorage
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Allow users to access dashboard and other pages without forcing onboarding
  // Users can complete profile details later in Settings if needed
  // Onboarding is now optional, not required

  return <>{children}</>;
};

export default ProtectedRoute;

