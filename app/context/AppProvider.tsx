'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { ChatProvider } from './ChatContext';
import { LibraryProvider } from './LibraryContext';
import { SpeechProvider } from './SpeechContext';
import GuestRedirector from '../components/auth/GuestRedirector';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ChatProvider>
        <LibraryProvider>
          <SpeechProvider>
            <GuestRedirector>
              {children}
            </GuestRedirector>
          </SpeechProvider>
        </LibraryProvider>
      </ChatProvider>
    </AuthProvider>
  );
} 