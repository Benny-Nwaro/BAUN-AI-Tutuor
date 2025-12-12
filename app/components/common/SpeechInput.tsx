'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { CheetahTranscript } from '@picovoice/cheetah-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import { useSpeech } from '@/app/context/SpeechContext';

interface SpeechInputProps {
  onTextReceived: (text: string) => void;
  buttonClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost' | 'minimal';
}

export default function SpeechInput({ 
  onTextReceived, 
  buttonClassName = '',
  size = 'md',
  variant = 'outline'
}: SpeechInputProps) {
  // Get global speech recognition state
  const { 
    cheetah, 
    isInitializing, 
    isInitialized,
    isOnline,
    initSpeechRecognition,
    registerTranscriptCallback,
    unregisterTranscriptCallback
  } = useSpeech();

  // Local component state
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Store callback ID when registered
  const callbackIdRef = useRef<string | null>(null);

  // Function to handle transcript from Cheetah
  const transcriptCallback = (cheetahTranscript: CheetahTranscript) => {
    setVisualFeedback(true);
    
    if (cheetahTranscript.transcript) {
      setTranscript(prev => {
        const newTranscript = prev + cheetahTranscript.transcript;
        return newTranscript;
      });
    }
    
    // If endpoint detected, send the complete transcript
    if (cheetahTranscript.isEndpoint) {
      // Visual feedback on successful recognition
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 500);
      
      // Reset transcript after sending to parent
      if (transcript.trim()) {
        onTextReceived(transcript.trim());
        setTranscript('');
      }
    }
  };
  
  // Register the transcript callback on mount
  useEffect(() => {
    // Register the callback
    callbackIdRef.current = registerTranscriptCallback(transcriptCallback);
    
    // Unregister on unmount
    return () => {
      if (callbackIdRef.current) {
        unregisterTranscriptCallback(callbackIdRef.current);
        callbackIdRef.current = null;
      }
    };
  }, [registerTranscriptCallback, unregisterTranscriptCallback, onTextReceived]);

  // Initialize on first mount
  useEffect(() => {
    if (isOnline && !cheetah && !isInitializing) {
      initSpeechRecognition();
    }
  }, [isOnline, cheetah, isInitializing, initSpeechRecognition]);

  // Start speech processing
  const startListening = () => {
    if (!cheetah) return;
    
    // First unsubscribe if already subscribed
    try {
      WebVoiceProcessor.unsubscribe(cheetah);
    } catch (e) {
      // Ignore errors if not subscribed
    }
    
    // Start processing
    try {
      WebVoiceProcessor.subscribe(cheetah);
      setIsListening(true);
      setVisualFeedback(true);
      setTranscript('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setErrorMessage('Failed to start speech recognition');
    }
  };

  // Stop speech processing
  const stopListening = () => {
    if (!cheetah) return;
    
    try {
      WebVoiceProcessor.unsubscribe(cheetah);
      
      // Send any remaining transcript
      if (transcript.trim()) {
        onTextReceived(transcript.trim());
        setTranscript('');
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
    
    setIsListening(false);
    setVisualFeedback(false);
  };

  // Toggle listening state and start/stop recognition
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      // Handle initialization
      if (!cheetah) {
        // If offline and not initialized
        if (!isOnline && !isInitialized) {
          setErrorMessage('Speech recognition requires internet connection for first-time setup. Please connect briefly to the internet and try again.');
          return;
        }
        
        // If online but not initialized yet
        if (isOnline && !isInitialized && !isInitializing) {
          initSpeechRecognition();
          setErrorMessage('Setting up speech recognition. Please try again in a moment.');
          return;
        }
        
        // If currently initializing
        if (isInitializing) {
          setErrorMessage('Speech recognition is initializing. Please try again in a moment.');
          return;
        }
        
        // If we shouldn't have cheetah at this point, something is wrong
        setErrorMessage('Speech recognition not available');
        return;
      }
      
      // Start listening if we have cheetah
      startListening();
    }
  };

  // Size-based classes
  const sizeClasses = {
    sm: 'h-8 w-8 p-1',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2'
  };

  // Icon sizes
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Variant-based classes
  const getVariantClasses = () => {
    if (isListening) {
      return 'text-white bg-red-500 hover:bg-red-600 border border-red-500 shadow-md';
    }
    
    switch (variant) {
      case 'primary':
        return 'text-white bg-primary hover:bg-primary-light border border-primary shadow-sm';
      case 'outline':
        return 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm';
      case 'ghost':
        return 'text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent';
      case 'minimal':
        return 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-transparent border-transparent';
      default:
        return 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm';
    }
  };

  const buttonSizeClass = sizeClasses[size];
  const iconSizeClass = iconSizes[size];

  // Determine button state and tooltip
  const isButtonDisabled = isInitializing || (!cheetah && !isOnline && !isInitialized);
  const buttonTooltip = isInitializing
    ? "Initializing speech recognition..."
    : !cheetah && !isOnline && !isInitialized
      ? "Speech recognition requires internet for setup"
      : isListening
        ? "Stop listening"
        : "Start voice input";

  return (
    <div className="relative inline-flex items-center z-10">
      <button
        type="button"
        onClick={toggleListening}
        disabled={isButtonDisabled}
        className={`
          flex items-center justify-center rounded-full 
          transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonSizeClass}
          ${getVariantClasses()}
          ${pulseAnimation ? 'animate-pulse' : ''}
          ${isInitializing ? 'animate-pulse bg-blue-400 dark:bg-blue-600 text-white border-blue-400' : ''}
          ${buttonClassName}
        `}
        title={buttonTooltip}
      >
        {isListening ? (
          <StopIcon className={iconSizeClass} />
        ) : (
          <MicrophoneIcon className={iconSizeClass} />
        )}
        <span className="sr-only">{buttonTooltip}</span>
      </button>
      
      {isListening && (
        <div className="absolute -top-1 -right-1 h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
      )}
      
      {visualFeedback && (
        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-1 px-1.5 py-1 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-md shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]"></span>
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-[pulse_0.7s_ease-in-out_0.2s_infinite]"></span>
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-[pulse_0.7s_ease-in-out_0.4s_infinite]"></span>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="absolute bottom-full mb-2 right-0 z-20 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-md whitespace-nowrap shadow-sm max-w-[250px] sm:max-w-none truncate sm:whitespace-normal">
          {errorMessage}
        </div>
      )}
      
      {isInitializing && !errorMessage && (
        <div className="absolute bottom-full mb-2 right-0 z-20 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-md whitespace-nowrap shadow-sm">
          Initializing speech recognition...
        </div>
      )}

      {/* Live transcript preview (for debugging) */}
      {isListening && transcript && (
        <div className="absolute bottom-full mb-10 right-0 z-20 text-xs bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 p-2 rounded-md whitespace-normal shadow-sm max-w-[250px] sm:max-w-[400px]">
          {transcript}
        </div>
      )}
    </div>
  );
} 