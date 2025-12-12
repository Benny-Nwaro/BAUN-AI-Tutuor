import { UserRole } from './types';

/**
 * Determines the user role based on the current URL path
 * Used to ensure the correct role is selected when a user accesses a specific page directly
 */
export function getRoleFromURL(): UserRole | null {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  
  const pathname = window.location.pathname;
  console.log(`Detecting role from URL path: ${pathname}`);
  
  // Check if we're on the tutor page
  if (pathname.includes('/tutor')) {
    console.log('URL path indicates student role');
    return 'student';
  }
  
  // Check if we're on the teaching assistant page
  if (pathname.includes('/teaching-assistant')) {
    console.log('URL path indicates teacher role');
    return 'teacher';
  }
  
  // No specific role detected from URL
  console.log('No specific role detected from URL');
  return null;
} 