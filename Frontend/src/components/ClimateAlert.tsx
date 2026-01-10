import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocation } from '../hooks/useLocation';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X, Info, AlertCircle, Wind, Droplet, Thermometer } from 'lucide-react';

export interface ClimateAlert {
  type: 'high_temperature' | 'heavy_rainfall' | 'drought' | 'storm' | 'extreme_wind';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
}

interface ClimateAlertProps {
  onAlertsChange?: (alerts: ClimateAlert[]) => void;
}

const ClimateAlert = ({ onAlertsChange }: ClimateAlertProps) => {
  const { location } = useLocation();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<ClimateAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchAlerts();
    }
  }, [location.latitude, location.longitude]);

  const fetchAlerts = async () => {
    if (!location.latitude || !location.longitude) return;

    setLoading(true);
    try {
      const response = await api.getClimateAlerts(location.latitude, location.longitude);
      if (response.data?.alerts) {
        setAlerts(response.data.alerts);
        onAlertsChange?.(response.data.alerts);
      }
    } catch (error: any) {
      console.error('Failed to fetch climate alerts:', error);
      // Silently fail for alerts - they're optional
      setAlerts([]);
      onAlertsChange?.([]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high_temperature':
        return <Thermometer size={20} />;
      case 'heavy_rainfall':
      case 'drought':
        return <Droplet size={20} />;
      case 'storm':
      case 'extreme_wind':
        return <Wind size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const handleDismiss = (index: number) => {
    setDismissedAlerts((prev) => new Set(prev).add(index.toString()));
  };

  const visibleAlerts = alerts.filter((_, index) => !dismissedAlerts.has(index.toString()));

  if (!location.latitude || !location.longitude) {
    return null;
  }

  if (loading) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-800">
          <Info size={18} />
          <span className="text-sm">{t('alerts.checkingAlerts')}</span>
        </div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center gap-2 text-green-800">
          <Info size={18} />
          <span className="text-sm font-medium">{t('alerts.noAlerts')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <AlertTriangle size={24} className="text-orange-500" /> {t('alerts.title')}
      </h2>
      {visibleAlerts.map((alert, index) => {
        const originalIndex = alerts.indexOf(alert);
        return (
          <div
            key={originalIndex}
            className={`card border-2 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm uppercase">{alert.severity}</span>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-xs opacity-75 capitalize">{alert.type.replace('_', ' ')}</span>
                  </div>
                  <p className="font-semibold mb-2">{alert.message}</p>
                  <p className="text-sm opacity-90">{alert.recommendation}</p>
                </div>
              </div>
                    <button
                      onClick={() => handleDismiss(originalIndex)}
                      className="p-1 hover:bg-black/10 rounded transition-colors"
                      title={t('alerts.dismiss')}
                    >
                      <X size={18} />
                    </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClimateAlert;
