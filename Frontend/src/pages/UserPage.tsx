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

interface DatabaseStatus {
  status: 'connected' | 'disconnected';
  error?: string;
  responseTime?: number;
  timestamp?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin';
  is_onboarded?: boolean;
  location?: string;
  land_size?: number;
  soil_type?: string;
  picture_url?: string;
  created_at?: string;
}

const UserPage = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setError(null);
      const response = await api.getUserProfile();
      
      if (response.user) {
        setUserProfile(response.user);
      }
      
      if (response.database) {
        setDbStatus({
          status: response.database.status === 'connected' ? 'connected' : 'disconnected',
          error: response.database.error || undefined,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDatabaseStatus = async () => {
    try {
      setRefreshing(true);
      const response = await api.getDatabaseStatus();
      setDbStatus(response);
    } catch (err: any) {
      setDbStatus({
        status: 'disconnected',
        error: err.message || 'Failed to check database status',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(() => {
      fetchDatabaseStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchUserData();
    fetchDatabaseStatus();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin h-8 w-8 text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            User Information
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View your profile and database connectivity status
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Connectivity Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Status Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Database size={24} />
              Database Status
            </h2>
            {dbStatus?.status === 'connected' ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <XCircle className="text-red-500" size={24} />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Connection Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dbStatus?.status === 'connected'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {dbStatus?.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {dbStatus?.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Error:</strong> {dbStatus.error}
                </p>
              </div>
            )}

            {dbStatus?.responseTime && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Response Time: {dbStatus.responseTime}ms
              </div>
            )}

            {dbStatus?.timestamp && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Last checked: {formatDateDisplay(dbStatus.timestamp)}
              </div>
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User size={24} />
              User Profile
            </h2>
            {authUser?.role === 'admin' && (
              <Shield className="text-primary-500" size={24} />
            )}
          </div>

          {userProfile ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{userProfile.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Mail size={16} />
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{userProfile.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Shield size={16} />
                  Role
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1 capitalize">
                  {userProfile.role}
                </p>
              </div>

              {userProfile.location && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <MapPin size={16} />
                    Location
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{userProfile.location}</p>
                </div>
              )}

              {userProfile.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Calendar size={16} />
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {formatDateDisplay(userProfile.created_at)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Onboarding Status
                </label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {userProfile.is_onboarded ? (
                    <span className="text-green-600 dark:text-green-400">Completed</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No user data available</p>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {dbStatus?.status === 'disconnected' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                Database Connection Issue
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                The application cannot connect to the database. Please check:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                <li>MySQL server is running</li>
                <li>Database credentials are correct</li>
                <li>Network connectivity is available</li>
                <li>Database server is accessible on the configured port</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
