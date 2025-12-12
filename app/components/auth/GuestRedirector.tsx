'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getActiveGuestRole, hasGuestUser } from '@/app/lib/guestMode';

interface GuestRedirectorProps {
  children: React.ReactNode;
}

/**
 * Component that handles guest mode redirection
 * Automatically redirects users to their active guest mode interface
 * if they have one set and try to access the home page
 */
export default function GuestRedirector({ children }: GuestRedirectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Only redirect from specific paths 
    // Don't redirect if user is already on a role-specific page
    if (
      pathname.includes('/tutor') || 
      pathname.includes('/teaching-assistant') ||
      pathname.includes('/login') ||
      pathname.includes('/signup')
    ) {
      return;
    }
    
    // Get the active guest role
    const activeRole = getActiveGuestRole();
    
    // Only redirect if there's an active role and a valid guest user for that role
    if (activeRole && hasGuestUser(activeRole)) {
      console.log(`Active guest role detected: ${activeRole}. Redirecting...`);
      
      if (activeRole === 'student') {
        router.replace('/tutor');
      } else if (activeRole === 'teacher') {
        router.replace('/teaching-assistant');
      }
    }
  }, [pathname, router]);
  
  // Render children without affecting the component tree
  return <>{children}</>;
} 