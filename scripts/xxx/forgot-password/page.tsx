'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import Input from '@/app/components/common/Input';
import Button from '@/app/components/common/Button';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword, isAuthenticated, isEmailConfirmed, isGuest } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect already authenticated users
  useEffect(() => {
    // Only redirect fully authenticated users, not guests
    if (isAuthenticated && isEmailConfirmed && !isGuest) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isEmailConfirmed, isGuest, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Simple validation
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await resetPassword(email);
      
      if (response.success) {
        setSuccess('Password reset instructions have been sent to your email. Please check your inbox.');
        setEmail(''); // Clear the form
      } else {
        setError(response.error || 'Failed to send reset instructions. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Don't render the form if user is already authenticated - just return null
  if (isAuthenticated && isEmailConfirmed && !isGuest) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-md">
              {success}
            </div>
          )}
          
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            enableSpeech={true}
          />
          
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !!success}
          >
            Send Reset Instructions
          </Button>
          
          <div className="text-center mt-4">
            <Link href="/login" className="text-primary hover:text-primary-dark text-sm">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 