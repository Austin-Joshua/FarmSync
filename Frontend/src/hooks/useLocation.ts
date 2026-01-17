import { useState, useEffect } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  district?: string;
  state?: string;
  country?: string;
  address?: string;
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
}

/**
 * Custom hook to get user's GPS location
 * Requests permission and retrieves coordinates
 */
export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionGranted: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser. Please use a modern browser (Chrome, Firefox, Safari, Edge).',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionGranted: true,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location service is unavailable. Please check: 1) Location services are enabled on your device, 2) Browser has location permission, 3) You are connected to internet (for IP-based location).';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or check your internet connection.';
            break;
          default:
            errorMessage = `Location error: ${error.message || 'An unknown error occurred.'}`;
            break;
        }
        setLocation((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionGranted: false,
        }));
      },
      {
        enableHighAccuracy: false, // Set to false for faster response with IP-based location
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000, // Cache location for 5 minutes (300000ms)
      }
    );
  };

  // Auto-request on mount (optional - can be removed if you want manual trigger)
  useEffect(() => {
    // Don't auto-request - let user trigger it
    // requestLocation();
  }, []);

  return {
    location,
    requestLocation,
  };
};
