// Service Worker Registration Utility
import { registerServiceWorker } from './pushNotifications';

/**
 * Register service worker on app initialization
 * This should be called once when the app starts
 */
export const initializeServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      await registerServiceWorker();
      console.log('Service Worker initialized successfully');
    } catch (error) {
      console.error('Service Worker initialization failed:', error);
    }
  }
};
