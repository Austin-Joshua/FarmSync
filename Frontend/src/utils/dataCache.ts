// Simple data caching utility to prevent unnecessary API calls
// Cache expires after 5 minutes and persists across page reloads using localStorage

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = 'farmsync_cache_';

export class DataCache {
  private static cache: Map<string, CacheEntry<any>> = new Map();
  private static initialized = false;

  /**
   * Initialize cache from localStorage
   */
  private static init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      // Load all cache entries from localStorage
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
          const cacheKey = key.replace(STORAGE_PREFIX, '');
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const entry: CacheEntry<any> = JSON.parse(stored);
              // Check if expired
              const now = Date.now();
              if (now - entry.timestamp <= CACHE_EXPIRY_MS) {
                this.cache.set(cacheKey, entry);
              } else {
                // Remove expired entry
                localStorage.removeItem(key);
              }
            } catch (e) {
              // Invalid entry, remove it
              localStorage.removeItem(key);
            }
          }
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize cache from localStorage:', error);
    }
  }

  /**
   * Save cache entry to localStorage
   */
  private static saveToStorage(key: string, entry: CacheEntry<any>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = STORAGE_PREFIX + key;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded or other storage errors
      console.warn('Failed to save cache to localStorage:', error);
      // Try to clear some old entries
      this.clearExpired();
    }
  }

  /**
   * Remove cache entry from localStorage
   */
  private static removeFromStorage(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = STORAGE_PREFIX + key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove cache from localStorage:', error);
    }
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  static get<T>(key: string): T | null {
    this.init();
    
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      // Cache expired
      this.cache.delete(key);
      this.removeFromStorage(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  static set<T>(key: string, data: T): void {
    this.init();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    
    this.cache.set(key, entry);
    this.saveToStorage(key, entry);
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string): void {
    this.cache.delete(key);
    this.removeFromStorage(key);
  }

  /**
   * Clear all cache
   */
  static clearAll(): void {
    this.cache.clear();
    
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn('Failed to clear cache from localStorage:', error);
      }
    }
  }

  /**
   * Clear expired cache entries
   */
  static clearExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_EXPIRY_MS) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.removeFromStorage(key);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  static has(key: string): boolean {
    this.init();
    
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      this.cache.delete(key);
      this.removeFromStorage(key);
      return false;
    }

    return true;
  }
}

// Clean up expired cache entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    DataCache.clearExpired();
  }, 60 * 1000); // Every minute
}
