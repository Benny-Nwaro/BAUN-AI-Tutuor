'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { EnvelopeIcon, UserIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function SignupForm() {
  const router = useRouter();
  const { signup, user, isAuthenticated, isEmailConfirmed, isGuest } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize role from user if present
  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);
  
  // Redirect logged in users (except guests who are creating a real account)
  useEffect(() => {
    // For regular users who are authenticated with confirmed email
    if (isAuthenticated && !isGuest && isEmailConfirmed) {
      router.push('/dashboard');
    }
    // Don't redirect guests - they may want to create a permanent account
  }, [isAuthenticated, isGuest, isEmailConfirmed, router]);
  
  // Clear error when any field changes
  const clearError = () => {
    if (error) {
      setError('');
    }
    if (success) {
      setSuccess('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Simple validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signup(name, email, password, role);
      
      if (result.success) {
        // Show success message about account creation
        setSuccess('Account created successfully! You will be redirected to the login page in 2 seconds.');
        console.log('Signup successful, will redirect to login');
        
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Always redirect to login page after a short delay
        setTimeout(() => {
          console.log('Redirecting to login after signup');
          router.push('/login');
        }, 2000); // 2 second delay to show the success message
      } else {
        setError(result.error || 'Failed to create an account. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isCurrentUserGuest = user?.id?.startsWith('guest-') || false;
  
  // Don't render the form if user is already authenticated and not a guest - just return null
  if (isAuthenticated && !isGuest && !isLoading) {
    return null;
  }
  
  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isCurrentUserGuest ? 'Create Your Account' : 'Create an account'}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isCurrentUserGuest 
            ? 'Save your progress and continue your learning journey' 
            : 'Join Baun AI to enhance your learning or teaching'}
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
          id="name"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => { setName(e.target.value); clearError(); }}
          required
          icon={<UserIcon className="h-5 w-5 text-gray-400" />}
          enableSpeech={true}
        />
        
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearError(); }}
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
          onChange={(e) => { 
            setPassword(e.target.value); 
            clearError(); 
            // Only validate password match if confirmPassword has a value
            if (confirmPassword && e.target.value !== confirmPassword) {
              setError('Passwords do not match');
            }
          }}
          required
          icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
          helperText="Password must be at least 6 characters long"
        />
        
        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => { 
            setConfirmPassword(e.target.value); 
            clearError(); 
            // Validate password match
            if (password !== e.target.value) {
              setError('Passwords do not match');
            }
          }}
          required
          icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
        />
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            I am a:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Student</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === 'teacher'}
                onChange={() => setRole('teacher')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Teacher</span>
            </label>
          </div>
        </div>
        
        <div className="text-sm">
          <Link href="/login" className="text-primary hover:text-primary-dark">
            Already have an account? Sign in
          </Link>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading || !!success}
        >
          {isCurrentUserGuest ? 'Create Account' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
} 