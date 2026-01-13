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
      await registerServiceWorker();
      await setupOfflineSync();
      console.log('Service Worker initialized successfully');
    } catch (error) {
      console.error('Service Worker initialization failed:', error);
    }
  }
};
