'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearActiveGuestRole, clearGuestData } from '@/app/lib/guestMode';
import Button from '../common/Button';
import LogoutConfirmation from './LogoutConfirmationGuest';
import { useAuth } from '@/app/context/AuthContext';

interface GuestLogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Button that allows users to completely logout from guest mode
 */
export default function GuestLogoutButton({ 
  variant = 'primary', 
  size = 'sm',
  className
}: GuestLogoutButtonProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleClick = () => {
    setShowConfirmation(true);
  };
  
  const handleConfirm = async () => {
    setIsLoggingOut(true);
    
    try {
      // First, determine what role the current guest user has
      const guestRole = user?.role || 'student';
      
      // Clear the specific guest data for this role
      clearGuestData(guestRole);
      
      // Clear the active guest role marker
      clearActiveGuestRole();
      
      // Set a flag in localStorage to prevent redirect loops
      localStorage.setItem('just-logged-out', 'true');
      
      // Directly navigate to home page before logout (prevents redirect issues)
      window.location.replace('/ai/');
      
      // The logout will be automatically handled by the AuthContext's effect
      // when the page refreshes, due to the guest data being cleared
    } catch (error) {
      console.error('Error logging out from guest mode:', error);
      setIsLoggingOut(false);
      setShowConfirmation(false);
    }
  };
  
  const handleCancel = () => {
    setShowConfirmation(false);
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoggingOut}
        className={className}
      >
        Exit Guest Mode
      </Button>
      
      <LogoutConfirmation
        isOpen={showConfirmation}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        isLoading={isLoggingOut}
        isGuest={true}
      />
    </>
  );
} 