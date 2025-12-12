'use client';

import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatInterface from '../components/chat/ChatInterface';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useChat } from '../context/ChatContext';

export default function TeachingAssistantPage() {
  const { setCurrentRole } = useChat();
  
  // Force teacher role when this page is loaded
  useEffect(() => {
    console.log('TeachingAssistantPage: Setting role to teacher');
    setCurrentRole('teacher');
  }, [setCurrentRole]);
  
  return (
    <ProtectedRoute roleRequired="teacher">
      <MainLayout>
        <div className="h-[calc(100vh-64px)]">
          <ChatInterface userRole="teacher" />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 