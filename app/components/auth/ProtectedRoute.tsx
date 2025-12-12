'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

type ProtectedRouteProps = {
  children: ReactNode;
  roleRequired?: 'student' | 'teacher';
  allowGuest?: boolean; // Whether guest users are allowed
  requireEmailConfirmation?: boolean; // Whether email confirmation is required
};

export default function ProtectedRoute({ 
  children, 
  roleRequired,
  allowGuest = true,
  requireEmailConfirmation = true
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isEmailConfirmed, isGuest } = useAuth();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Handle guest users
    if (!isLoading && isGuest) {
      if (!allowGuest) {
        // If guests are not allowed, redirect to signup
        router.push('/signup');
        return;
      }
      // Guests are allowed, so we don't need to check for email confirmation
    } 
    // Handle regular authenticated users
    else if (!isLoading && isAuthenticated && !isGuest) {
      // If email confirmation is required and email is not confirmed
      if (requireEmailConfirmation && !isEmailConfirmed) {
        router.push('/login');
        return;
      }

      // If role is required and user doesn't have that role, redirect
      if (roleRequired && user?.role !== roleRequired) {
        // Redirect to appropriate page based on current role
        if (user?.role === 'student') {
          router.push('/tutor');
        } else if (user?.role === 'teacher') {
          router.push('/teaching-assistant');
        } else {
          // No role assigned yet, go to role selection
          router.push('/');
        }
      }
    }
  }, [isLoading, user, router, roleRequired, isAuthenticated, isEmailConfirmed, isGuest, allowGuest, requireEmailConfirmation]);

  // Show loading while checking authentication and permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // Show message if email needs confirmation
  if (requireEmailConfirmation && !isEmailConfirmed && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Email Confirmation Required</h2>
          <p className="mb-4">Please check your email and confirm your account before accessing this page.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Show message if guest not allowed
  if (isGuest && !allowGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Account Required</h2>
          <p className="mb-4">This section requires a registered account. Please sign up to continue.</p>
          <button 
            onClick={() => router.push('/signup')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // Show message if wrong role
  if (roleRequired && user?.role !== roleRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Redirecting to the appropriate page for your role...</p>
        </div>
      </div>
    );
  }

  // If we get here, all checks have passed
  return <>{children}</>;
} 