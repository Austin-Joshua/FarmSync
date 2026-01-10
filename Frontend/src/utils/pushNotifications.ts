// Push Notification utilities
import api from '../services/api';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('This browser does not support service workers');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription
      // In production, you would get VAPID public key from your server
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured. Push notifications will not work.');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // Send subscription to server
    await sendSubscriptionToServer(subscription);

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(registration: ServiceWorkerRegistration): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      // Notify server to remove subscription
      await removeSubscriptionFromServer(subscription.endpoint);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Send subscription to server
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    // Dynamic import to avoid circular dependencies
    const apiModule = await import('../services/api');
    const api = apiModule.default;
    await api.subscribePushNotification(subscription);
    console.log('Subscription saved to server:', subscription.endpoint);
  } catch (error) {
    console.error('Failed to save subscription to server:', error);
    throw error;
  }
}

/**
 * Remove subscription from server
 */
async function removeSubscriptionFromServer(endpoint: string): Promise<void> {
  try {
    // Dynamic import to avoid circular dependencies
    const apiModule = await import('../services/api');
    const api = apiModule.default;
    await api.unsubscribePushNotification(endpoint);
    console.log('Subscription removed from server:', endpoint);
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
    throw error;
  }
}

/**
 * Convert VAPID key from base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Show local notification (for testing)
 */
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
