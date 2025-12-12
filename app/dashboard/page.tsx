'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getActiveGuestRole, hasGuestUser } from '../lib/guestMode';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isEmailConfirmed, isGuest } = useAuth();

  // Use useEffect for client-side routing
  useEffect(() => {
    if (isLoading) {
      // Still loading auth state, wait
      return;
    }
    
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (isGuest) {
      // Guest user, check active role first
      const activeGuestRole = getActiveGuestRole();
      
      if (activeGuestRole === 'teacher' && hasGuestUser('teacher')) {
        console.log('Guest teacher, redirecting to teaching assistant');
        router.push('/teaching-assistant');
      } else {
        // Default to student role for guests
        console.log('Guest user, redirecting to tutor');
        router.push('/tutor');
      }
      return;
    }
    
    if (!isEmailConfirmed && !isGuest) {
      // Email not confirmed, send back to login
      console.log('Email not confirmed, redirecting to login');
      router.push('/login');
      return;
    }

    // Authenticated user with confirmed email
    if (user?.role === 'student') {
      console.log('Student user, redirecting to tutor');
      router.push('/tutor');
    } else if (user?.role === 'teacher') {
      console.log('Teacher user, redirecting to teaching assistant');
      router.push('/teaching-assistant');
    } else {
      // Default role is student if not specified
      console.log('Unknown role, defaulting to tutor');
      router.push('/tutor');
    }
  }, [user, isLoading, router, isAuthenticated, isEmailConfirmed, isGuest]);

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Redirecting...
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we redirect you to the appropriate page.
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 