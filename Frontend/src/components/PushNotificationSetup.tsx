// Component for setting up push notifications
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
} from '../utils/pushNotifications';


const PushNotificationSetup = () => {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!('Notification' in window)) {
      setError('Your browser does not support notifications');
      return;
    }

    setPermission(Notification.permission);

    // Check if service worker is registered and subscription exists
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Request permission
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Notification permission was denied. Please enable it in your browser settings.');
        setIsLoading(false);
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setError('Failed to register service worker');
        setIsLoading(false);
        return;
      }

      // Subscribe to push
      const subscription = await subscribeToPush(registration);
      if (subscription) {
        setIsSubscribed(true);
      } else {
        setError('Failed to subscribe to push notifications. VAPID key may not be configured.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    setError('');

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await unsubscribeFromPush(registration);
        setIsSubscribed(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  if (!('Notification' in window)) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle size={20} />
          <span>Your browser does not support push notifications</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="text-primary-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">Receive alerts for climate warnings, low stock, and harvest reminders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {permission === 'granted' && isSubscribed ? (
              <button
                onClick={handleDisableNotifications}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2"
              >
                <BellOff size={18} />
                {isLoading ? 'Disabling...' : 'Disable'}
              </button>
            ) : (
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading || permission === 'denied'}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bell size={18} />
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {permission === 'denied' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            Notifications are blocked. Please enable them in your browser settings.
          </div>
        )}

        {permission === 'granted' && isSubscribed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            ✓ Push notifications are enabled. You will receive alerts for important events.
          </div>
        )}
      </div>

      {/* Notification preferences */}
      {permission === 'granted' && isSubscribed && (
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-3">Notification Preferences</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-700">Climate warnings (temperature, rainfall, drought)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-700">Low stock alerts</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-700">Harvest reminders</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationSetup;
