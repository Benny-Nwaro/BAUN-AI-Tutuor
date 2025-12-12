'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearnerProfile, getLearnerProfile } from '@/app/lib/learnerProfile';
import { useAuth } from './AuthContext';

type LearnerProfileContextType = {
  learnerProfile: LearnerProfile | null;
  refreshProfile: () => void;
  isLoading: boolean;
};

const LearnerProfileContext = createContext<LearnerProfileContextType | undefined>(undefined);

export function LearnerProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    if (!user?.id) {
      setLearnerProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const profile = getLearnerProfile(user.id);
      setLearnerProfile(profile);
    } catch (error) {
      console.error('Error loading learner profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  // Refresh profile function that can be called from components
  const refreshProfile = () => {
    loadProfile();
  };

  return (
    <LearnerProfileContext.Provider
      value={{
        learnerProfile,
        refreshProfile,
        isLoading
      }}
    >
      {children}
    </LearnerProfileContext.Provider>
  );
}

export function useLearnerProfile() {
  const context = useContext(LearnerProfileContext);
  if (context === undefined) {
    throw new Error('useLearnerProfile must be used within a LearnerProfileProvider');
  }
  return context;
} 