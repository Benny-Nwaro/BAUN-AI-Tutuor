'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function LoginForm() {
  const router = useRouter();
  const { login, continueAsGuest, isAuthenticated, isEmailConfirmed, isGuest } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect logged in users
  useEffect(() => {
    // Only redirect if user is authenticated, not a guest, and has confirmed email
    if (isAuthenticated && !isGuest && isEmailConfirmed) {
      router.push('/dashboard');
    }
    // Remove the redirection for guest users so they can access the login page
    // No longer redirecting guest users to /tutor
  }, [isAuthenticated, isGuest, isEmailConfirmed, router]);
  
  // Clear error when any field changes
  const clearMessages = () => {
    if (error) {
      setError('');
    }
    if (info) {
      setInfo('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    // Simple validation
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Proceed with login
      const result = await login(email, password);
      
      if (result.success) {
        // Show success message
        setInfo('Login successful! Redirecting to dashboard in 1 second...');
        console.log('Login successful, will redirect to dashboard');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          console.log('Redirecting to dashboard after login');
          router.push('/dashboard');
        }, 1000);
      } else {
        // Check if it's an email confirmation issue
        if (result.error?.toLowerCase().includes('confirm your email')) {
          setInfo(result.error);
        } else {
          // Handle other errors
          setError(result.error || 'Unable to sign in. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStudentGuest = () => {
    continueAsGuest('student');
    router.push('/tutor');
  };
  
  const handleTeacherGuest = () => {
    continueAsGuest('teacher');
    router.push('/teaching-assistant');
  };
  
  // Don't render the form if user is already authenticated - just return null
  if (isAuthenticated && !isGuest && !isLoading) {
    return null;
  }
  
  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-md">
            {error}
          </div>
        )}
        
        {info && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-md">
            {info}
          </div>
        )}
        
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
          required
          icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
          enableSpeech={true}
        />
        
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
          required
          icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/signup" className="text-primary hover:text-primary-dark">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="text-primary hover:text-primary-dark">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign in
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400">Or continue as guest</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleStudentGuest}
          >
            Student
          </Button>
          <Button
            variant="outline"
            onClick={handleTeacherGuest}
          >
            Teacher
          </Button>
        </div>
      </div>
    </div>
  );
}