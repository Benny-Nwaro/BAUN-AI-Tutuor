import { GuestUser, Conversation } from './types';

// Constants for localStorage keys
const GUEST_USER_KEY_PREFIX = 'buan-guest-user-'; // Prefix for role differentiation
const GUEST_USER_EXPIRY_KEY_PREFIX = 'buan-guest-user-expiry-'; // Prefix for expiry
const GUEST_USER_EXPIRY_DAYS = 200;

// IndexedDB configuration
const DB_NAME = 'buan-tutor-db';
const DB_VERSION = 1;
const CONVERSATIONS_STORE = 'conversations';

// Flag to track if DB initialization has been attempted
let dbInitialized = false;
let dbInitPromise: Promise<IDBDatabase> | null = null;

// Initialize IndexedDB
export async function initDB(): Promise<IDBDatabase> {
  // If we already have an initialization promise, return it
  if (dbInitPromise) {
    return dbInitPromise;
  }
  
  // Create new initialization promise
  dbInitPromise = new Promise((resolve, reject) => {
    console.log(`Initializing IndexedDB: ${DB_NAME}, version ${DB_VERSION}`);
    
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event);
        dbInitialized = false;
        dbInitPromise = null;
        reject(request.error);
      };
      
      request.onsuccess = (event) => {
        console.log('IndexedDB initialized successfully');
        dbInitialized = true;
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Add error handler to the database
        db.onerror = (event) => {
          console.error('IndexedDB error:', event);
        };
        
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('Upgrading IndexedDB schema');
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
          console.log(`Creating object store: ${CONVERSATIONS_STORE}`);
          db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' });
        }
      };
    } catch (error) {
      console.error('Critical error in IndexedDB initialization:', error);
      dbInitialized = false;
      dbInitPromise = null;
      reject(error);
    }
  });
  
  return dbInitPromise;
}

// Attempt to initialize the database as soon as possible
if (typeof window !== 'undefined') {
  // Only run in browser environment
  console.log('Attempting early IndexedDB initialization');
  initDB().catch(err => {
    console.error('Early IndexedDB initialization failed:', err);
  });
}

// Save conversation to IndexedDB
export async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite');
        const store = transaction.objectStore(CONVERSATIONS_STORE);
        const request = store.put(conversation);

        request.onerror = (e) => {
          console.error('Error saving conversation to IndexedDB:', e);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          console.log(`Conversation saved successfully: ${conversation.id}`);
          resolve();
        };
        
        // Add transaction complete handler for additional reliability
        transaction.oncomplete = () => {
          console.log(`Transaction completed for conversation: ${conversation.id}`);
        };
        
        transaction.onerror = (e) => {
          console.error('Transaction error when saving conversation:', e);
        };
      } catch (err) {
        console.error('Error creating transaction:', err);
        reject(err);
      }
    });
  } catch (err) {
    console.error('Error initializing IndexedDB for saving conversation:', err);
    throw err;
  }
}

// Get all conversations from IndexedDB
export async function getConversations(): Promise<Conversation[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([CONVERSATIONS_STORE], 'readonly');
        const store = transaction.objectStore(CONVERSATIONS_STORE);
        const request = store.getAll();

        request.onerror = (e) => {
          console.error('Error getting conversations from IndexedDB:', e);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          console.log(`Retrieved ${request.result ? request.result.length : 0} conversations`);
          resolve(request.result || []);
        };
      } catch (err) {
        console.error('Error creating transaction for getConversations:', err);
        reject(err);
      }
    });
  } catch (err) {
    console.error('Error initializing IndexedDB for getting conversations:', err);
    return [];
  }
}

// Get conversations filtered by role
export async function getConversationsByRole(role: 'student' | 'teacher'): Promise<Conversation[]> {
  try {
    // Get all conversations first
    const allConversations = await getConversations();
    
    // Filter by the specified role
    return allConversations.filter(conv => {
      // Strict filtering by role
      return conv.userRole === role;
    });
  } catch (err) {
    console.error(`Error getting conversations for role ${role}:`, err);
    return [];
  }
}

// Guest user management
export function setGuestUser(user: GuestUser): void {
  const key = `${GUEST_USER_KEY_PREFIX}${user.role}`; // Use role to differentiate
  const expiryKey = `${GUEST_USER_EXPIRY_KEY_PREFIX}${user.role}`; // Use role to differentiate
  localStorage.setItem(key, JSON.stringify(user));
  localStorage.setItem(
    expiryKey,
    new Date(Date.now() + GUEST_USER_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
  );
}

export function getGuestUser(role: 'student' | 'teacher'): GuestUser | null {
  const key = `${GUEST_USER_KEY_PREFIX}${role}`; // Use role to differentiate
  const expiryKey = `${GUEST_USER_EXPIRY_KEY_PREFIX}${role}`; // Use role to differentiate
  const userStr = localStorage.getItem(key);
  const expiryStr = localStorage.getItem(expiryKey);

  if (!userStr || !expiryStr) return null;

  const expiry = new Date(expiryStr);
  if (expiry < new Date()) {
    clearGuestData(role); // Clear specific role data
    return null;
  }

  return JSON.parse(userStr);
}

export function clearGuestData(role: 'student' | 'teacher'): void {
  const key = `${GUEST_USER_KEY_PREFIX}${role}`; // Use role to differentiate
  const expiryKey = `${GUEST_USER_EXPIRY_KEY_PREFIX}${role}`; // Use role to differentiate
  localStorage.removeItem(key);
  localStorage.removeItem(expiryKey);
}

// Clean up conversations with missing userRole property
export async function cleanupMissingRoleConversations(): Promise<void> {
  try {
    const db = await initDB();
    const allConversations = await getConversations();
    
    console.log(`Checking ${allConversations.length} conversations for missing userRole properties`);
    
    const missingRoleConvs = allConversations.filter(conv => conv.userRole === undefined);
    
    if (missingRoleConvs.length > 0) {
      console.log(`Found ${missingRoleConvs.length} conversations with missing userRole`);
      
      // Delete conversations with missing userRole
      for (const conv of missingRoleConvs) {
        try {
          const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite');
          const store = transaction.objectStore(CONVERSATIONS_STORE);
          
          console.log(`Deleting conversation with missing userRole: ${conv.id}`);
          
          const request = store.delete(conv.id);
          
          await new Promise<void>((resolve, reject) => {
            request.onerror = (e) => {
              console.error(`Error deleting conversation ${conv.id}:`, e);
              reject();
            };
            
            request.onsuccess = () => {
              resolve();
            };
          });
        } catch (err) {
          console.error(`Error during deletion of conversation ${conv.id}:`, err);
        }
      }
      
      console.log('Cleanup of conversations with missing userRole completed');
    } else {
      console.log('No conversations with missing userRole found');
    }
  } catch (err) {
    console.error('Error during conversation cleanup:', err);
  }
}

// Delete a conversation from IndexedDB
export async function deleteConversationFromDB(conversationId: string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite');
        const store = transaction.objectStore(CONVERSATIONS_STORE);
        const request = store.delete(conversationId);

        request.onerror = (e) => {
          console.error(`Error deleting conversation ${conversationId} from IndexedDB:`, e);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          console.log(`Conversation deleted successfully: ${conversationId}`);
          resolve();
        };
        
        transaction.oncomplete = () => {
          console.log(`Delete transaction completed for conversation: ${conversationId}`);
        };
        
        transaction.onerror = (e) => {
          console.error(`Transaction error when deleting conversation: ${conversationId}`, e);
        };
      } catch (err) {
        console.error('Error creating transaction for deleteConversationFromDB:', err);
        reject(err);
      }
    });
  } catch (err) {
    console.error('Error initializing IndexedDB for deleting conversation:', err);
    throw err;
  }
} 