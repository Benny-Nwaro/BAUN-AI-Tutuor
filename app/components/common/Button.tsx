'use client';

import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) {
  // Base classes for all buttons
  const baseClasses = 'flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size specific classes
  const sizeClasses = {
    sm: 'text-sm h-8 px-3 py-1 space-x-1.5',
    md: 'text-md h-10 px-4 py-2 space-x-2',
    lg: 'text-lg h-12 px-6 py-2.5 space-x-2.5 font-semibold',
  };
  
  // Variant specific classes - Updated for McDonald's yellow and black
  const variantClasses = {
    primary: 'bg-[#FFC72C] text-black hover:bg-[#FFBA00] dark:bg-[#FFC72C] dark:text-black dark:hover:bg-[#FFBA00]',
    secondary: 'bg-black text-[#FFC72C] hover:bg-neutral-800 dark:bg-black dark:text-[#FFC72C] dark:hover:bg-neutral-800',
    outline: 'border-2 border-[#FFC72C] text-black hover:bg-[#FFC72C]/10 dark:border-[#FFC72C] dark:text-[#FFC72C] dark:hover:bg-[#FFC72C]/10',
    ghost: 'text-black hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
    link: 'p-0 h-auto text-black underline-offset-4 hover:underline dark:text-[#FFC72C]',
  };
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="w-5 h-5 rounded-full animate-spin border-2 border-solid border-current border-t-transparent mr-2"></div>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
} 