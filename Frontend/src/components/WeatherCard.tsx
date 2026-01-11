import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { useTranslation } from 'react-i18next';
import {
  Thermometer,
  Droplet,
  CloudRain,
  Wind,
  MapPin,
  RefreshCw,
  AlertCircle,
  Loader,
} from 'lucide-react';

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  icon: string;
  pressure: number;
  visibility: number;
  feelsLike: number;
  timestamp: Date;
}

interface WeatherCardProps {
  onAlertsDetected?: (hasAlerts: boolean) => void;
}

const WeatherCard = ({ onAlertsDetected }: WeatherCardProps) => {
  const { location, requestLocation } = useLocation();
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch location name (optional - don't fail if this fails)
      try {
        const locationResponse = await api.getCurrentLocation(lat, lon);
        if (locationResponse.data) {
          const loc = locationResponse.data;
          setLocationName(
            loc.address || `${loc.district || ''}, ${loc.state || ''}`.trim() || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
          );
        } else {
          setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
      } catch (locError: any) {
        // If location name fetch fails, just use coordinates
        console.warn('Location name fetch failed, using coordinates:', locError);
        setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }

      // Fetch weather data
      const weatherResponse = await api.getCurrentWeather(lat, lon);
      if (weatherResponse.data) {
        setWeather(weatherResponse.data);
        setLastUpdate(new Date());
      } else {
        throw new Error('No weather data received from server');
      }

      // Check for alerts (optional - don't fail if this fails)
      try {
        const alertsResponse = await api.getClimateAlerts(lat, lon);
        if (alertsResponse.data?.alerts && alertsResponse.data.alerts.length > 0) {
          onAlertsDetected?.(true);
        } else {
          onAlertsDetected?.(false);
        }
      } catch (alertsError: any) {
        // Silently handle alerts error - they're optional
        console.warn('Alerts fetch failed:', alertsError);
        onAlertsDetected?.(false);
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      // Provide user-friendly error message
      let errorMessage = 'Failed to fetch weather data';
      if (err.message?.includes('API key')) {
        errorMessage = 'Weather API key not configured. Using mock data.';
      } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to weather service. Check your internet connection or backend server.';
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      
      // Still try to show coordinates even if API fails
      if (!locationName && location.latitude && location.longitude) {
        setLocationName(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  const handleRefresh = () => {
    if (location.latitude && location.longitude) {
      fetchWeatherData(location.latitude, location.longitude);
    } else {
      requestLocation();
    }
  };

  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return '🌤️';
    const iconMap: Record<string, string> = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  if (!location.latitude || !location.longitude) {
    return (
      <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <MapPin size={20} className="text-orange-600 dark:text-orange-400" />
            {t('weather.title')}
          </h3>
        </div>
        <div className="text-center py-6">
          <MapPin size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('weather.enableLocationMessage')}</p>
          <button
            onClick={requestLocation}
            className="btn-primary flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MapPin size={18} />
            {t('weather.enableLocation')}
          </button>
          {location.error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">{location.error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <MapPin size={20} className="text-orange-600 dark:text-orange-400" />
            {t('weather.title')}
          </h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
            title={t('weather.refresh')}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

      {loading && !weather && (
        <div className="flex items-center justify-center py-8">
          <Loader size={32} className="animate-spin text-orange-600 dark:text-orange-400" />
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
            Note: Weather data may be limited. Configure OpenWeather API key in Backend/.env for full features.
          </p>
        </div>
      )}

      {weather && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <MapPin size={14} className="text-orange-600 dark:text-orange-400" />
              {locationName || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </p>
                {lastUpdate && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {t('weather.updated')}: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{getWeatherIcon(weather.icon)}</div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(weather.temperature)}°C
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{weather.condition}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {t('weather.feelsLike')} {Math.round(weather.feelsLike)}°C
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                <Droplet size={16} className="text-blue-500 dark:text-blue-400" />
                <span className="text-xs">{t('weather.humidity')}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{weather.humidity}%</div>
            </div>

            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                <CloudRain size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs">{t('weather.rainfall')}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {weather.rainfall > 0 ? `${weather.rainfall.toFixed(1)}mm` : t('weather.none')}
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                <Wind size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-xs">{t('weather.windSpeed')}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {weather.windSpeed.toFixed(1)} m/s
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-700/60 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                <Thermometer size={16} className="text-orange-500 dark:text-orange-400" />
                <span className="text-xs">{t('weather.pressure')}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {weather.pressure} hPa
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherCard;
