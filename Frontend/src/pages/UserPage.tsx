// User Page with Database Connectivity Status and Error Display
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { formatDateDisplay } from '../utils/dateFormatter';
import { 
  User, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Shield,
  MapPin,
  Calendar,
  Loader
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface DatabaseStatus {
  status: 'connected' | 'disconnected';
  error?: string;
  responseTime?: number;
  timestamp?: string;
}

const UserPage = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      const healthResponse = await api.getHealth();
      setDbStatus({
        status: healthResponse.status === 200 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
      setDbStatus({
        status: 'disconnected',
        error: err.message || 'Server unreachable',
        timestamp: new Date().toISOString(),
      });
      toast.error('Could not connect to the server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="animate-spin h-12 w-12 text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <User className="text-accent" size={32} />
            {t('settings.profile') || 'User Profile'}
          </h1>
          <p className="text-text-muted mt-1">
            System diagnostics and account overview
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} size={18} />
          {t('common.refresh') || 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="card hover:shadow-lg transition-shadow border-t-4 border-accent">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-accent font-bold text-2xl">
              {authUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">{authUser?.name}</h2>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Shield size={14} />
                <span className="capitalize">{authUser?.role}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface-sunken/50 rounded-lg">
              <Mail className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('emailAddress')}</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{authUser?.email}</p>
              </div>
            </div>

            {authUser?.location && (
              <div className="flex items-center gap-3 p-3 bg-surface-sunken/50 rounded-lg">
                <MapPin className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('profile.location')}</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{authUser.location}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
              <span className="text-sm font-medium text-text-muted">Onboarding Status</span>
              {authUser?.is_onboarded ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded uppercase">Completed</span>
              ) : (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded uppercase">Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="card hover:shadow-lg transition-shadow border-t-4 border-indigo-600">
          <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            System Health
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-sunken/50 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">Backend API</span>
              <div className="flex items-center gap-2">
                {dbStatus?.status === 'connected' ? (
                  <>
                    <span className="text-green-600 dark:text-green-400 font-bold">ONLINE</span>
                    <CheckCircle className="text-green-500" size={18} />
                  </>
                ) : (
                  <>
                    <span className="text-danger dark:text-red-400 font-bold">OFFLINE</span>
                    <XCircle className="text-danger" size={18} />
                  </>
                )}
              </div>
            </div>

            {dbStatus?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-danger dark:text-red-400 leading-relaxed font-mono">
                  {dbStatus.error}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-6">
              <Calendar size={14} />
              <span>Last ping: {dbStatus?.timestamp ? formatDateDisplay(dbStatus.timestamp) : 'Never'}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-warning dark:text-amber-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-300">System Warning</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Some services are taking longer than usual to respond. This might affect data synchronization.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;

