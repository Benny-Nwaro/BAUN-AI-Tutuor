'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { CheetahWorker, CheetahTranscript } from '@picovoice/cheetah-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

// Access key from environment variable
const PICOVOICE_ACCESS_KEY = process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY || 'AqWdpv4Yxo/kGhiesb4ZRX7Ru6A89vJMPOJXt9UCMgZq6IRgK2dN0A==';
// Path to the model file relative to public directory
const MODEL_PATH = '/ai/cheetah_params.pv';

// Constants for localStorage
const CHEETAH_INITIALIZED_KEY = 'cheetah_initialized';

// Generate a random ID for callback registration
const generateId = () => Math.random().toString(36).substring(2, 11);

// Type for the callback registry
type CallbackRegistry = {
  [key: string]: (transcript: CheetahTranscript) => void;
};

type SpeechContextType = {
  cheetah: CheetahWorker | null;
  isInitializing: boolean;
  isInitialized: boolean;
  isOnline: boolean;
  initSpeechRecognition: () => Promise<void>;
  registerTranscriptCallback: (callback: (transcript: CheetahTranscript) => void) => string;
  unregisterTranscriptCallback: (id: string) => void;
};

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  // Main state
  const [cheetah, setCheetah] = useState<CheetahWorker | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // Refs
  const isInitializingRef = useRef(false);
  const hasModelBeenVerified = useRef(false);
  const callbacksRef = useRef<CallbackRegistry>({});
  
  // Register a transcript callback
  const registerTranscriptCallback = (callback: (transcript: CheetahTranscript) => void): string => {
    const id = generateId();
    callbacksRef.current[id] = callback;
    return id;
  };
  
  // Unregister a transcript callback
  const unregisterTranscriptCallback = (id: string): void => {
    if (callbacksRef.current[id]) {
      delete callbacksRef.current[id];
    }
  };
  
  // Master transcript callback that forwards to all registered callbacks
  const masterTranscriptCallback = (transcript: CheetahTranscript): void => {
    Object.values(callbacksRef.current).forEach(callback => {
      try {
        callback(transcript);
      } catch (e) {
        console.error('Error in transcript callback:', e);
      }
    });
  };
  
  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check if model file exists
  const verifyModelExists = async (): Promise<boolean> => {
    try {
      if (hasModelBeenVerified.current) {
        return true;
      }
      
      const response = await fetch(MODEL_PATH, { method: 'HEAD' });
      const exists = response.ok;
      
      if (exists) {
        console.log('Cheetah model file found');
        hasModelBeenVerified.current = true;
      } else {
        console.error('Cheetah model file not found:', MODEL_PATH);
      }
      
      return exists;
    } catch (error) {
      console.error('Error checking model file:', error);
      return false;
    }
  };
  
  // Initialize Cheetah for speech recognition
  const initCheetah = async (): Promise<CheetahWorker | null> => {
    if (isInitializingRef.current) return null;
    
    isInitializingRef.current = true;
    setIsInitializing(true);
    
    try {
      // Check if key exists
      if (!PICOVOICE_ACCESS_KEY) {
        throw new Error('Picovoice access key is missing. Please set NEXT_PUBLIC_PICOVOICE_ACCESS_KEY in your .env.local file.');
      }
      
      console.log('Initializing Cheetah with accessKey:', 
        PICOVOICE_ACCESS_KEY.substring(0, 5) + '...');
      
      const cheetahInstance = await CheetahWorker.create(
        PICOVOICE_ACCESS_KEY,
        masterTranscriptCallback,
        { publicPath: MODEL_PATH }
      );
      
      // Mark as initialized in localStorage and state
      localStorage.setItem(CHEETAH_INITIALIZED_KEY, 'true');
      setIsInitialized(true);
      console.log('Cheetah initialized successfully for speech recognition');
      
      return cheetahInstance;
    } catch (error) {
      console.error('Failed to initialize Cheetah:', error);
      localStorage.removeItem(CHEETAH_INITIALIZED_KEY);
      setIsInitialized(false);
      return null;
    } finally {
      isInitializingRef.current = false;
      setIsInitializing(false);
    }
  };
  
  // Public method to initialize speech recognition
  const initSpeechRecognition = async () => {
    // If Cheetah is already initialized, do nothing
    if (cheetah) {
      return;
    }
    
    // Only initialize if we're online and model exists
    if (isOnline && await verifyModelExists()) {
      const cheetahInstance = await initCheetah();
      if (cheetahInstance) {
        setCheetah(cheetahInstance);
      }
    }
  };
  
  // Check initialization state on mount
  useEffect(() => {
    const checkInitState = async () => {
      const initialized = localStorage.getItem(CHEETAH_INITIALIZED_KEY) === 'true';
      setIsInitialized(initialized);
      
      if (initialized && isOnline && !cheetah && !isInitializing) {
        await initSpeechRecognition();
      }
    };
    
    checkInitState();
  }, [isOnline, cheetah, isInitializing]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cheetah) {
        try {
          WebVoiceProcessor.unsubscribe(cheetah);
          // Only release when component is unmounting
          cheetah.release().catch(console.error);
        } catch (error) {
          console.error('Error releasing Cheetah:', error);
        }
      }
    };
  }, [cheetah]);
  
  // Auto-initialize when we come back online
  useEffect(() => {
    if (isOnline && !cheetah && !isInitializing && !isInitializingRef.current) {
      initSpeechRecognition();
    }
  }, [isOnline, cheetah, isInitializing]);
  
  return (
    <SpeechContext.Provider
      value={{
        cheetah,
        isInitializing,
        isInitialized,
        isOnline,
        initSpeechRecognition,
        registerTranscriptCallback,
        unregisterTranscriptCallback
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
} 