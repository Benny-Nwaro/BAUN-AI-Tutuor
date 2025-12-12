// Simple wrapper for localStorage with fallback for when it's not available
// or when in private browsing mode where localStorage might have limited capacity

export const storage = {
  setItem: (key: string, value: any): void => {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  
  getItem: (key: string, defaultValue: any = null): any => {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
};

// For future implementation: IndexedDB wrapper for storing larger amounts of data
// and enabling more advanced offline capabilities
export class IndexedDBHelper {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;
  
  constructor(dbName: string, storeName: string, dbVersion: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbVersion = dbVersion;
  }
  
  // Initialize the database
  public init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('This browser doesn\'t support IndexedDB'));
        return;
      }
      
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error('Error opening database'));
      };
      
      request.onsuccess = (event) => {
        resolve(true);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }
  
  // Store data
  public setItem(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error('Error opening database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const item = { id: key, data };
        const storeRequest = store.put(item);
        
        storeRequest.onsuccess = () => {
          resolve();
        };
        
        storeRequest.onerror = () => {
          reject(new Error('Error storing data'));
        };
      };
    });
  }
  
  // Retrieve data
  public getItem(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error('Error opening database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            resolve(getRequest.result.data);
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => {
          reject(new Error('Error retrieving data'));
        };
      };
    });
  }
  
  // Remove an item
  public removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error('Error opening database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const deleteRequest = store.delete(key);
        
        deleteRequest.onsuccess = () => {
          resolve();
        };
        
        deleteRequest.onerror = () => {
          reject(new Error('Error removing data'));
        };
      };
    });
  }
  
  // Clear all data
  public clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        reject(new Error('Error opening database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          resolve();
        };
        
        clearRequest.onerror = () => {
          reject(new Error('Error clearing data'));
        };
      };
    });
  }
} 