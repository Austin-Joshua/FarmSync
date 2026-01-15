/**
 * Utility to clean up browser cache and service workers
 * This prevents stale code from being served on page refresh
 */

export async function cleanupAllCaches(): Promise<void> {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterPromises = registrations.map(reg => reg.unregister());
      await Promise.all(unregisterPromises);
    }

    // Delete all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(name => caches.delete(name));
      await Promise.all(deletePromises);
    }

    console.log('Cache cleanup completed successfully');
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

/**
 * Force a hard refresh by clearing local storage version
 * This can be called when you need to force users to reload
 */
export function forceHardRefresh(): void {
  localStorage.removeItem('app-version');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.clear();
  // Force reload from server, bypassing cache
  window.location.href = window.location.href;
}
