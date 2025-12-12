import { UserRole } from './types';
import { v4 as uuidv4 } from 'uuid';

// Constants for localStorage keys
export const GUEST_MODE_KEYS = {
  ACTIVE_GUEST_ROLE: 'buan-active-guest-role',      // 'student', 'teacher', or null
  GUEST_USER_PREFIX: 'buan-guest-user-',            // Prefix for guest user data
  GUEST_EXPIRY_PREFIX: 'buan-guest-user-expiry-',   // Prefix for expiry dates
};

export const GUEST_USER_EXPIRY_DAYS = 200;

/**
 * Gets the currently active guest role
 * @returns The active guest role or null if no active role
 */
export function getActiveGuestRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  
  const role = localStorage.getItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE);
  if (role === 'student' || role === 'teacher') {
    return role;
  }
  return null;
}

/**
 * Sets the active guest role
 * @param role The role to set as active
 */
export function setActiveGuestRole(role: UserRole | null): void {
  if (typeof window === 'undefined') return;
  
  if (role) {
    localStorage.setItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE, role);
    console.log(`Set active guest role: ${role}`);
  } else {
    localStorage.removeItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE);
    console.log('Cleared active guest role');
  }
}

/**
 * Clears the active guest role (logout)
 */
export function clearActiveGuestRole(): void {
  setActiveGuestRole(null);
}

/**
 * Checks if a guest user exists for the given role
 * @param role The role to check
 * @returns True if a guest user exists for this role
 */
export function hasGuestUser(role: UserRole): boolean {
  if (typeof window === 'undefined') return false;
  
  const key = `${GUEST_MODE_KEYS.GUEST_USER_PREFIX}${role}`;
  const expiryKey = `${GUEST_MODE_KEYS.GUEST_EXPIRY_PREFIX}${role}`;
  
  const userStr = localStorage.getItem(key);
  const expiryStr = localStorage.getItem(expiryKey);
  
  if (!userStr || !expiryStr) return false;
  
  // Check if guest user has expired
  const expiry = new Date(expiryStr);
  if (expiry < new Date()) {
    clearGuestData(role);
    return false;
  }
  
  return true;
}

/**
 * Gets the guest user data for the given role
 * @param role The role to get data for
 * @returns The guest user data or null if none exists
 */
export function getGuestUser(role: UserRole): any | null {
  if (typeof window === 'undefined') return null;
  
  const key = `${GUEST_MODE_KEYS.GUEST_USER_PREFIX}${role}`;
  const expiryKey = `${GUEST_MODE_KEYS.GUEST_EXPIRY_PREFIX}${role}`;
  
  const userStr = localStorage.getItem(key);
  const expiryStr = localStorage.getItem(expiryKey);
  
  if (!userStr || !expiryStr) return null;
  
  // Check if guest user has expired
  const expiry = new Date(expiryStr);
  if (expiry < new Date()) {
    clearGuestData(role);
    return null;
  }
  
  return JSON.parse(userStr);
}

/**
 * Creates a new guest user for the given role
 * @param role The role for the new guest user
 * @returns The new guest user data
 */
export function createGuestUser(role: UserRole): any {
  if (typeof window === 'undefined') return null;
  
  // Generate a unique ID with the role for clarity
  const guestId = `guest-${role}-${uuidv4().slice(0, 8)}`;
  
  // Create user object
  const guestUser = {
    id: guestId,
    email: '',
    name: `Guest ${role.charAt(0).toUpperCase() + role.slice(1)}`, // Guest Student or Guest Teacher
    role,
    createdAt: new Date().toISOString(),
    emailConfirmed: true
  };
  
  // Save to localStorage
  const key = `${GUEST_MODE_KEYS.GUEST_USER_PREFIX}${role}`;
  const expiryKey = `${GUEST_MODE_KEYS.GUEST_EXPIRY_PREFIX}${role}`;
  
  localStorage.setItem(key, JSON.stringify(guestUser));
  localStorage.setItem(
    expiryKey,
    new Date(Date.now() + GUEST_USER_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
  );
  
  console.log(`Created new guest user for role: ${role}`);
  return guestUser;
}

/**
 * Clears the guest data for the given role
 * @param role The role to clear data for
 */
export function clearGuestData(role: UserRole): void {
  if (typeof window === 'undefined') return;
  
  const key = `${GUEST_MODE_KEYS.GUEST_USER_PREFIX}${role}`;
  const expiryKey = `${GUEST_MODE_KEYS.GUEST_EXPIRY_PREFIX}${role}`;
  
  localStorage.removeItem(key);
  localStorage.removeItem(expiryKey);
  
  // If this was the active role, clear that too
  const activeRole = getActiveGuestRole();
  if (activeRole === role) {
    clearActiveGuestRole();
  }
  
  console.log(`Cleared guest data for role: ${role}`);
}

/**
 * Determines if the app should redirect to a guest role interface
 * @returns The role to redirect to, or null if no redirect needed
 */
export function shouldRedirectToGuestInterface(): UserRole | null {
  // Check if there's an active guest role
  const activeRole = getActiveGuestRole();
  
  // If there's an active role and a valid guest user for that role
  if (activeRole && hasGuestUser(activeRole)) {
    return activeRole;
  }
  
  return null;
}

/**
 * Cleans up any expired guest accounts
 * This should be called periodically to prevent buildup of old guest accounts
 */
export function cleanupExpiredGuestAccounts(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Check both roles
    ['student', 'teacher'].forEach((role) => {
      const key = `${GUEST_MODE_KEYS.GUEST_USER_PREFIX}${role}`;
      const expiryKey = `${GUEST_MODE_KEYS.GUEST_EXPIRY_PREFIX}${role}`;
      
      const userStr = localStorage.getItem(key);
      const expiryStr = localStorage.getItem(expiryKey);
      
      if (userStr && expiryStr) {
        const expiry = new Date(expiryStr);
        if (expiry < new Date()) {
          // Expired, clear it
          localStorage.removeItem(key);
          localStorage.removeItem(expiryKey);
          console.log(`Cleared expired guest account for role: ${role}`);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired guest accounts:', error);
  }
}

/**
 * Switches between guest modes (student/teacher)
 * This allows a user to switch roles while maintaining separate conversations
 * @param newRole The role to switch to
 * @returns The user data for the new role
 */
export function switchGuestRole(newRole: UserRole): any | null {
  if (typeof window === 'undefined') return null;
  
  // Check if the user has an existing account for this role
  if (!hasGuestUser(newRole)) {
    // Create a new guest account for this role if none exists
    createGuestUser(newRole);
  }
  
  // Set this as the active role
  setActiveGuestRole(newRole);
  
  // Return the user data for the new role
  return getGuestUser(newRole);
}

/**
 * Completely removes all guest data for both roles
 * Use this when a user wants to fully remove all guest data
 */
export function clearAllGuestData(): void {
  if (typeof window === 'undefined') return;
  
  // Clear data for both roles
  clearGuestData('student');
  clearGuestData('teacher');
  
  // Clear the active role
  clearActiveGuestRole();
  
  console.log('Cleared all guest data');
} 