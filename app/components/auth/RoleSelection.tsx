'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/app/context/AuthContext';
import Button from '../common/Button';
import { 
  createGuestUser, 
  hasGuestUser, 
  getGuestUser, 
  setActiveGuestRole 
} from '@/app/lib/guestMode';

export default function RoleSelection() {
  const router = useRouter();
  const { continueAsGuest } = useAuth();
  
  const handleStudentGuest = () => {
    // Check if there's an existing guest student account
    if (!hasGuestUser('student')) {
      // Create a new guest student account
      createGuestUser('student');
    }
    
    // Set as active guest role
    setActiveGuestRole('student');
    
    // Use the Auth Context to update the app state
    continueAsGuest('student');
    
    // Navigate to the tutor page
    router.push('/tutor');
  };
  
  const handleTeacherGuest = () => {
    // Check if there's an existing guest teacher account
    if (!hasGuestUser('teacher')) {
      // Create a new guest teacher account
      createGuestUser('teacher');
    }
    
    // Set as active guest role
    setActiveGuestRole('teacher');
    
    // Use the Auth Context to update the app state
    continueAsGuest('teacher');
    
    // Navigate to the teaching assistant page
    router.push('/teaching-assistant');
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
          Welcome to Baun AI
        </h1>
        <p className="text-xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto">
          Your personalized AI educational platform that adapts to your needs,
          whether you&apos;re a student looking to learn or a teacher creating lesson plans.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="homepage-hero bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center text-center animate-fade-in">
          <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-full mb-6">
            <BookOpenIcon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-[#FFC72C] mb-4">
            Buan AI Tutor
          </h2>
          <p className="text-black dark:text-gray-300 mb-8">
            Perfect for students who want to learn concepts broken down into step-by-step explanations.
            Get detailed answers to your questions and build a stronger understanding of any subject.
          </p>
          <div className="mt-auto space-y-4 w-full">
            <Button
              fullWidth
              size="lg"
              onClick={handleStudentGuest}
            >
              Try as Student
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-400">
              No account required
            </div>
          </div>
        </div>
        
        <div className="tutor-section bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center text-center animate-fade-in">
          <div className="bg-secondary/10 dark:bg-secondary/20 p-4 rounded-full mb-6">
            <AcademicCapIcon className="h-12 w-12 text-secondary dark:text-[#FFC72C]" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-[#FFC72C] mb-4">
            Baun AI Teaching Assistant
          </h2>
          <p className="text-black dark:text-gray-300 mb-8">
            Designed for teachers to create lesson plans, manage classroom activities,
            and generate engaging teaching materials with the help of AI.
          </p>
          <div className="mt-auto space-y-4 w-full">
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={handleTeacherGuest}
            >
              Try as Teacher
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-400">
              No account required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 