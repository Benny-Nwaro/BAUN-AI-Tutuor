'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import Button from '../common/Button';
import { AcademicCapIcon, UserCircleIcon, Bars3Icon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import LogoutConfirmation from '../auth/LogoutConfirmation';
import GuestLogoutButton from '../auth/GuestLogoutButton';
import { usePathname, useRouter } from 'next/navigation';
import QuizModal from '../quiz/QuizModal';
import UserProfileMenu from './UserProfileMenu';
import Modal from '../common/Modal';
import LessonPlanGenerator from '../lessonPlanner/LessonPlanGenerator';
import LibraryModal from '../library/LibraryModal';
import { 
  createGuestUser, 
  hasGuestUser, 
  getGuestUser, 
  setActiveGuestRole 
} from '@/app/lib/guestMode';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isGuest, continueAsGuest } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isTeacherPage = pathname?.includes('/teaching-assistant');
  const isStudentPage = pathname?.includes('/tutor');

  // Determine current role based on path or user role
  const currentRole = isTeacherPage ? 'teacher' : isStudentPage ? 'student' : user?.role || 'student';

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
    setMobileMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/ai/');
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirmation(false);
    }
  };

  // Function to handle opening the quiz modal - only if user is a student
  const handleOpenQuiz = () => {
    if (currentRole === 'student') {
      setShowQuizModal(true);
      setMobileMenuOpen(false);
    }
  };

  // Function to handle opening the library modal
  const handleOpenLibrary = () => {
    setShowLibraryModal(true);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleStudentGuest = () => {
    if (!hasGuestUser('student')) {
      createGuestUser('student');
    }
    setActiveGuestRole('student');
    continueAsGuest('student');
    router.push('/tutor');
    setMobileMenuOpen(false);
  };

  const handleTeacherGuest = () => {
    if (!hasGuestUser('teacher')) {
      createGuestUser('teacher');
    }
    setActiveGuestRole('teacher');
    continueAsGuest('teacher');
    router.push('/teaching-assistant');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80 border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex items-center justify-between px-4 sm:px-6 py-3" aria-label="Global">
          <div className="flex items-center">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center">
              <Image 
                src="/ai/baun_logo.png" 
                alt="Baun Robotics Logo" 
                width={40} 
                height={40} 
              />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Show student/teacher buttons on homepage regardless of guest status */}
            {isHomePage ? (
              <div className="flex items-center gap-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleStudentGuest}
                >
                  Student
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleTeacherGuest}
                >
                  Teacher
                </Button>
              </div>
            ) : (
              /* Show user profile and buttons on non-homepage */
              user ? (
                <div className="flex items-center gap-x-2">
                  {/* Profile Menu - Using our new component */}
                  <UserProfileMenu 
                    userRole={currentRole as 'student' | 'teacher'}
                    onOpenLessonPlanner={() => setShowLessonPlanModal(true)}
                    onOpenQuiz={handleOpenQuiz}
                    onOpenLibrary={handleOpenLibrary}
                  />
                  
                  {/* Display name next to profile icon */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                    {user.role && (
                      <span className={`text-xs ${user.role === 'student' ? 'text-primary' : 'text-secondary'}`}>
                        {isGuest ? 'Guest Mode' : user.role === 'student' ? 'Student Mode' : 'Teacher Mode'}
                      </span>
                    )}
                  </div>
                  
                  {/* Logout Button */}
                  {isGuest ? (
                    <GuestLogoutButton 
                      variant="primary"
                      size="sm"
                    />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStudentGuest}
                  >
                    Student
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleTeacherGuest}
                  >
                    Teacher
                  </Button>
                </div>
              )
            )}
          </div>
        </nav>
        
        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 shadow-lg animate-fade-in">
            <div className="px-4 py-4 space-y-4">
              {isHomePage ? (
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center"
                    onClick={handleStudentGuest}
                  >
                    Student
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full justify-center"
                    onClick={handleTeacherGuest}
                  >
                    Teacher
                  </Button>
                </div>
              ) : (
                user && (
                  <div className="space-y-3">
                    {/* User info in mobile menu */}
                    <div className="flex items-center gap-x-3 px-2 py-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <UserCircleIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user.name}
                        </div>
                        {user.role && (
                          <div className={`text-xs ${user.role === 'student' ? 'text-primary' : 'text-secondary'}`}>
                            {isGuest ? 'Guest Mode' : user.role === 'student' ? 'Student Mode' : 'Teacher Mode'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Tools section */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                        Tools
                      </div>
                      {/* Library option - Both roles */}
                      <button
                        onClick={() => {
                          handleOpenLibrary();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      >
                        <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        Document Library
                      </button>
                      
                      {currentRole === 'teacher' && (
                        <button
                          onClick={() => {
                            setShowLessonPlanModal(true);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-2 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                          Lesson Plan Generator
                        </button>
                      )}
                      
                      {currentRole === 'student' && (
                        <button
                          onClick={() => {
                            handleOpenQuiz();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-2 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                        >
                          <AcademicCapIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                          Practice Quizzes
                        </button>
                      )}
                    </div>
                    
                    {/* Logout button */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      {isGuest ? (
                        <div className="px-2">
                          <GuestLogoutButton 
                            variant="primary"
                            size="sm"
                            className="w-full justify-center"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center w-full px-2 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Logout
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation 
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
      
      {/* Quiz Modal - Only shown for students */}
      {currentRole === 'student' && (
        <QuizModal 
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {/* Lesson Plan Modal - Only shown for teachers */}
      {currentRole === 'teacher' && (
        <Modal
          isOpen={showLessonPlanModal}
          onClose={() => setShowLessonPlanModal(false)}
          title="Lesson Plan Generator"
          size="lg"
        >
          <LessonPlanGenerator />
        </Modal>
      )}

      {/* Library Modal - Shown for both roles */}
      <LibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        userRole={currentRole as 'student' | 'teacher'}
      />
    </>
  );
} 
