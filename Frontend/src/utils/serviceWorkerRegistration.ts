// Service Worker Registration Utility
import { registerServiceWorker } from './pushNotifications';
import { setupOfflineSync } from './offlineStorage';

/**
 * Register service worker on app initialization
 * This should be called once when the app starts
 * DISABLED: Service workers cause caching issues in development
 */
export const initializeServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister any existing service workers to prevent caching issues
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      console.log('All service workers unregistered and caches cleared');
    } catch (error) {
      console.error('Service Worker cleanup failed:', error);
    }
  }
};
