/**
 * IndexedDB utilities for offline storage
 */

import { IndexedDBHelper } from './storageHelper';
import { 
  getConversations as getStorageConversations,
  saveConversation,
  cleanupMissingRoleConversations,
  deleteConversationFromDB
} from './storage';

// Re-export the storage functions
export {
  getStorageConversations as getConversations,
  saveConversation,
  cleanupMissingRoleConversations,
  deleteConversationFromDB
};

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Create an instance of IndexedDBHelper for user data, but only in browser
const userDataDB = isBrowser 
  ? new IndexedDBHelper('baun-user-data', 'user-data')
  : null;

// Initialize the database if in browser
if (isBrowser && userDataDB) {
  userDataDB.init().catch(error => {
    console.error('Failed to initialize IndexedDB:', error);
  });
}

/**
 * Opens the IndexedDB database
 */
export const openDB = async (name: string, version: number): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Error opening database');
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if the object store already exists
      if (!db.objectStoreNames.contains('user-data')) {
        db.createObjectStore('user-data');
      }
    };
  });
};

/**
 * Stores data in IndexedDB for a specific key
 */
export const storeUserData = async (key: string, data: any): Promise<void> => {
  try {
    // Add timestamps for syncing
    let dataToStore = data;
    
    // If this is an array of conversations, add timestamp to each item
    if (Array.isArray(data)) {
      dataToStore = data.map(item => {
        // If item is a conversation (has an id and messages property)
        if (item && typeof item === 'object' && item.id && item.messages) {
          return {
            ...item,
            lastUpdated: item.lastUpdated || new Date().toISOString(),
            synced: false
          };
        }
        return item;
      });
    }
    
    const db = await openDB('user-store', 1);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user-data'], 'readwrite');
      const store = transaction.objectStore('user-data');
      const request = store.put(dataToStore, key);
      
      request.onerror = () => {
        console.error('Error storing data');
        reject('Error storing data');
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error('Error in storeUserData:', error);
    throw error;
  }
};

/**
 * Gets data from IndexedDB for a specific key
 */
export const getUserData = async (key: string): Promise<any> => {
  try {
    const db = await openDB('user-store', 1);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user-data'], 'readonly');
      const store = transaction.objectStore('user-data');
      const request = store.get(key);
      
      request.onerror = () => {
        console.error('Error getting data');
        reject('Error getting data');
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  } catch (error) {
    console.error('Error in getUserData:', error);
    throw error;
  }
};

/**
 * Checks if we're online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine === true;
};

/**
 * Clear user data from IndexedDB
 */
export async function clearUserData(key: string): Promise<boolean> {
  if (!isBrowser || !userDataDB) return false;
  
  try {
    await userDataDB.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
}

/**
 * Clear all user data from IndexedDB
 */
export async function clearAllUserData(): Promise<boolean> {
  if (!isBrowser || !userDataDB) return false;
  
  try {
    await userDataDB.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all user data:', error);
    return false;
  }
} 