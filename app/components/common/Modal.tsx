'use client';

import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle Escape key press to close modal
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Determine modal width based on size prop
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-2xl',
    lg: 'max-w-md sm:max-w-2xl md:max-w-4xl',
    xl: 'max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl',
    full: 'max-w-[95%] h-[95%]'
  };
  
  // If clicked outside modal content, close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh]`}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-zinc-900 z-10 flex-shrink-0">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white truncate pr-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none flex-shrink-0"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
} 
 
 