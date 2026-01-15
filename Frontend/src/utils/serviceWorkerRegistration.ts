// Service Worker Registration Utility
import { registerServiceWorker } from './pushNotifications';
import { setupOfflineSync } from './offlineStorage';

/**
 * Register service worker on app initialization
 * This should be called once when the app starts
 */
export const initializeServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // Don't register service worker in development to avoid caching issues
      if (import.meta.env.DEV) {
        console.log('Service Worker disabled in development mode');
        // Unregister any existing service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        return;
      }

      await registerServiceWorker();
      await setupOfflineSync();
      console.log('Service Worker initialized successfully');
    } catch (error) {
      console.error('Service Worker initialization failed:', error);
    }
  }
};
