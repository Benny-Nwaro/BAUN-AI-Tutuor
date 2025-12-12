'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isOnline } from '@/app/lib/indexedDb';
import { GUEST_MODE_KEYS } from '@/app/lib/guestMode';

export type UserRole = 'student' | 'teacher';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isEmailConfirmed: boolean;
  isOffline: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{success: boolean; error?: string; redirectToLogin?: boolean}>;
  logout: () => Promise<void>;
  continueAsGuest: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<{success: boolean; error?: string}>;
  updatePassword: (password: string) => Promise<{success: boolean; error?: string}>;
};

export type ExtendedAuthUser = AuthUser & { emailConfirmed: boolean };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER_KEY_PREFIX = 'buan-guest-user-';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Track online/offline status
  useEffect(() => {
    setIsOffline(!isOnline());
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper function to get the role-specific guest user key
  const getGuestUserKey = (role: UserRole) => `${GUEST_USER_KEY_PREFIX}${role}`;

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check for active guest role
        const activeRole = localStorage.getItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE);
        
        if (activeRole === 'student' || activeRole === 'teacher') {
          // Only get the guest user for the active role
          const guestUser = localStorage.getItem(getGuestUserKey(activeRole as UserRole));
          
          if (guestUser) {
            const parsedUser = JSON.parse(guestUser);
            setUser({
              ...parsedUser,
              emailConfirmed: true
            });
            setIsEmailConfirmed(true);
            setIsGuest(true);
            console.log(`Logged in as guest ${activeRole}: ${parsedUser.name}`);
          } else {
            // No guest user found for active role
            setUser(null);
            setIsEmailConfirmed(false);
            setIsGuest(false);
          }
        } else {
          // No active role, set user to null
          setUser(null);
          setIsEmailConfirmed(false);
          setIsGuest(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setIsEmailConfirmed(false);
        setIsGuest(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    setIsGuest(!!user && user.id.startsWith('guest-'));
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For now, we'll just use guest mode
      const role: UserRole = 'student'; // Default role
      const guestUser: ExtendedAuthUser = {
        id: `guest-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role,
        emailConfirmed: true
      };
      
      localStorage.setItem(getGuestUserKey(role), JSON.stringify(guestUser));
      localStorage.setItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE, role);
      
      setUser(guestUser);
      setIsGuest(true);
      setIsEmailConfirmed(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Failed to login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // For now, we'll just use guest mode
      const guestUser = {
        id: `guest-${Date.now()}`,
        email,
        name,
        role,
        emailConfirmed: true
      };
      
      localStorage.setItem(getGuestUserKey(role), JSON.stringify(guestUser));
      localStorage.setItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE, role);
      
      setUser(guestUser);
      setIsGuest(true);
      setIsEmailConfirmed(true);
      
      return { success: true, redirectToLogin: false };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to sign up' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear guest user data
      if (user?.role) {
        localStorage.removeItem(getGuestUserKey(user.role));
      }
      localStorage.removeItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE);
      
      setUser(null);
      setIsGuest(false);
      setIsEmailConfirmed(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = (role: UserRole) => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      email: `guest-${Date.now()}@example.com`,
      name: `Guest ${role}`,
      role,
      emailConfirmed: true
    };
    
    localStorage.setItem(getGuestUserKey(role), JSON.stringify(guestUser));
    localStorage.setItem(GUEST_MODE_KEYS.ACTIVE_GUEST_ROLE, role);
    
    setUser(guestUser);
    setIsGuest(true);
    setIsEmailConfirmed(true);
  };

  const resetPassword = async (email: string) => {
    // Not implemented in guest mode
    return { success: false, error: 'Password reset not available in guest mode' };
  };

  const updatePassword = async (password: string) => {
    // Not implemented in guest mode
    return { success: false, error: 'Password update not available in guest mode' };
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGuest,
    isEmailConfirmed,
    isOffline,
    login,
    signup,
    logout,
    continueAsGuest,
    resetPassword,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 