'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  UserCircleIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

interface UserProfileMenuProps {
  userRole: 'student' | 'teacher';
  onOpenLessonPlanner?: () => void;
  onOpenQuiz?: () => void;
  onOpenLibrary?: () => void;
}

export default function UserProfileMenu({ 
  userRole, 
  onOpenLessonPlanner, 
  onOpenQuiz,
  onOpenLibrary
}: UserProfileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        aria-expanded={isMenuOpen}
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userRole === 'teacher' ? 'Teaching Assistant' : 'Student Tutor'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {userRole === 'teacher' ? 'Teacher tools' : 'Student tools'}
            </p>
          </div>
          
          <div className="py-1">
            {/* Library Option - Available for both roles */}
            <button
              onClick={() => {
                if (onOpenLibrary) {
                  onOpenLibrary();
                  setIsMenuOpen(false);
                }
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <BookOpenIcon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
              Document Library
            </button>
            
            {/* Teacher-specific options */}
            {userRole === 'teacher' && (
              <button
                onClick={() => {
                  if (onOpenLessonPlanner) {
                    onOpenLessonPlanner();
                    setIsMenuOpen(false);
                  }
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <DocumentTextIcon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                Lesson Plan Generator
              </button>
            )}
            
            {/* Student-specific options */}
            {userRole === 'student' && (
              <button
                onClick={() => {
                  if (onOpenQuiz) {
                    onOpenQuiz();
                    setIsMenuOpen(false);
                  }
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChartBarIcon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                Practice Quizzes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 