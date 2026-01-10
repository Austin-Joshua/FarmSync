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
        error: 'Geolocation is not supported by your browser',
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
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
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
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
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
