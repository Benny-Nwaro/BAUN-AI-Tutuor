'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SpeechInput from './SpeechInput';

type InputProps = {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  helperText?: string;
  enableSpeech?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      className = '',
      icon,
      helperText,
      enableSpeech = false,
    },
    ref
  ) => {
    // State to track password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [justCleared, setJustCleared] = useState(false);
    
    // Reset justCleared flag after a delay
    useEffect(() => {
      let timeout: NodeJS.Timeout;
      if (justCleared) {
        timeout = setTimeout(() => {
          setJustCleared(false);
        }, 1000); // Show clear button for 1 second after clearing
      }
      return () => clearTimeout(timeout);
    }, [justCleared]);
    
    // Determine if this is a password input
    const isPassword = type === 'password';
    
    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    // Determine actual input type
    const inputType = isPassword 
      ? (showPassword ? 'text' : 'password') 
      : type;
    
    // Handle speech input
    const handleSpeechResult = (text: string) => {
      if (onChange && typeof value === 'string') {
        // Create a synthetic event to pass to onChange
        const syntheticEvent = {
          target: {
            value: value + (value.length > 0 && !value.endsWith(' ') ? ' ' : '') + text,
            id,
            name: id,
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      }
    };

    // Clear input field
    const handleClearInput = () => {
      if (onChange) {
        const syntheticEvent = {
          target: {
            value: '',
            id,
            name: id,
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
        setJustCleared(true);
      }
    };
    
    // Check if input is empty
    const isInputEmpty = !value || value.length === 0;
    
    // Show clear button if input has text or was just cleared
    const showClearButton = !isInputEmpty || justCleared;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`w-full rounded-md border border-input px-4 py-2 text-sm transition-colors 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed 
              ${icon ? 'pl-10' : ''} 
              ${isPassword ? 'pr-10' : ''} 
              ${enableSpeech && !isPassword ? 'pr-12' : ''}
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'} 
              ${className}`}
          />
          
          {/* Password toggle button */}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1} // So it doesn't get focus when tabbing through the form
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          )}
          
          {/* Speech input or clear button */}
          {enableSpeech && !isPassword && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              {showClearButton ? (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-opacity duration-200 ${
                    justCleared && isInputEmpty ? 'opacity-70' : 'opacity-100'
                  }`}
                  title="Clear input"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Clear input</span>
                </button>
              ) : (
                <SpeechInput 
                  onTextReceived={handleSpeechResult}
                  variant="minimal"
                  size="sm"
                />
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 