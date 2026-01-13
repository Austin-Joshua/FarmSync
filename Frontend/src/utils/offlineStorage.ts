// Offline Storage Utility using IndexedDB
// This provides offline data storage and sync capabilities

const DB_NAME = 'FarmSyncDB';
const DB_VERSION = 1;
const STORES = {
  PENDING_OPS: 'pendingOperations',
  CACHED_DATA: 'cachedData',
  FORM_QUEUE: 'formQueue',
};

let db: IDBDatabase | null = null;

export const initOfflineStorage = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create pending operations store
      if (!database.objectStoreNames.contains(STORES.PENDING_OPS)) {
        const pendingOpsStore = database.createObjectStore(STORES.PENDING_OPS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        pendingOpsStore.createIndex('timestamp', 'timestamp', { unique: false });
        pendingOpsStore.createIndex('type', 'type', { unique: false });
      }

      // Create cached data store
      if (!database.objectStoreNames.contains(STORES.CACHED_DATA)) {
        const cachedDataStore = database.createObjectStore(STORES.CACHED_DATA, {
          keyPath: 'key',
        });
        cachedDataStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Create form queue store
      if (!database.objectStoreNames.contains(STORES.FORM_QUEUE)) {
        const formQueueStore = database.createObjectStore(STORES.FORM_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        formQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
        formQueueStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
};

export interface PendingOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
  retries: number;
}

export interface FormQueueItem {
  id?: number;
  formType: string;
  formData: any;
  timestamp: number;
  synced: boolean;
}

// Queue an operation for offline sync
export const queueOperation = async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.PENDING_OPS], 'readwrite');
  const store = transaction.objectStore(STORES.PENDING_OPS);

  const pendingOp: PendingOperation = {
    ...operation,
    timestamp: Date.now(),
    retries: 0,
  };

  await new Promise<void>((resolve, reject) => {
    const request = store.add(pendingOp);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to queue operation'));
  });
};

// Queue a form submission for offline sync
export const queueFormSubmission = async (formType: string, formData: any): Promise<void> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.FORM_QUEUE], 'readwrite');
  const store = transaction.objectStore(STORES.FORM_QUEUE);

  const queueItem: FormQueueItem = {
    formType,
    formData,
    timestamp: Date.now(),
    synced: false,
  };

  await new Promise<void>((resolve, reject) => {
    const request = store.add(queueItem);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to queue form submission'));
  });
};

// Get all pending operations
export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.PENDING_OPS], 'readonly');
  const store = transaction.objectStore(STORES.PENDING_OPS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Failed to get pending operations'));
  });
};

// Get all unsynced form submissions
export const getUnsyncedForms = async (): Promise<FormQueueItem[]> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.FORM_QUEUE], 'readonly');
  const store = transaction.objectStore(STORES.FORM_QUEUE);
  const index = store.index('synced');

  return new Promise((resolve, reject) => {
    const request = index.getAll(false);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Failed to get unsynced forms'));
  });
};

// Mark operation as synced
export const markOperationSynced = async (id: number): Promise<void> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.PENDING_OPS], 'readwrite');
  const store = transaction.objectStore(STORES.PENDING_OPS);

  await new Promise<void>((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to mark operation as synced'));
  });
};

// Mark form as synced
export const markFormSynced = async (id: number): Promise<void> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.FORM_QUEUE], 'readwrite');
  const store = transaction.objectStore(STORES.FORM_QUEUE);

  await new Promise<void>((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.synced = true;
        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error('Failed to mark form as synced'));
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(new Error('Failed to get form item'));
  });
};

// Cache data for offline access
export const cacheData = async (key: string, data: any): Promise<void> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.CACHED_DATA], 'readwrite');
  const store = transaction.objectStore(STORES.CACHED_DATA);

  await new Promise<void>((resolve, reject) => {
    const request = store.put({
      key,
      data,
      timestamp: Date.now(),
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to cache data'));
  });
};

// Get cached data
export const getCachedData = async (key: string): Promise<any | null> => {
  const database = await initOfflineStorage();
  const transaction = database.transaction([STORES.CACHED_DATA], 'readonly');
  const store = transaction.objectStore(STORES.CACHED_DATA);

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.data : null);
    };
    request.onerror = () => reject(new Error('Failed to get cached data'));
  });
};

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Sync pending operations when back online
export const syncPendingOperations = async (): Promise<void> => {
  if (!isOnline()) {
    return;
  }

  const pendingOps = await getPendingOperations();
  
  for (const op of pendingOps) {
    try {
      // Attempt to sync operation
      const response = await fetch(op.endpoint, {
        method: op.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(op.data),
      });

      if (response.ok) {
        await markOperationSynced(op.id!);
      } else {
        // Increment retries
        op.retries++;
        if (op.retries >= 3) {
          // Remove after 3 failed retries
          await markOperationSynced(op.id!);
        }
      }
    } catch (error) {
      console.error('Failed to sync operation:', error);
      op.retries++;
      if (op.retries >= 3) {
        await markOperationSynced(op.id!);
      }
    }
  }
};

// Initialize offline storage and set up sync listeners
export const setupOfflineSync = async (): Promise<void> => {
  await initOfflineStorage();

  // Listen for online event
  window.addEventListener('online', () => {
    console.log('Back online, syncing pending operations...');
    syncPendingOperations();
  });

  // Periodically try to sync if online
  setInterval(() => {
    if (isOnline()) {
      syncPendingOperations();
    }
  }, 30000); // Every 30 seconds
};
