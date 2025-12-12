'use client';

import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatInterface from '../components/chat/ChatInterface';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useChat } from '../context/ChatContext';

export default function TutorPage() {
  const { setCurrentRole } = useChat();
  
  // Force student role when this page is loaded
  useEffect(() => {
    console.log('TutorPage: Setting role to student');
    setCurrentRole('student');
  }, [setCurrentRole]);
  
  return (
    <ProtectedRoute roleRequired="student">
      <MainLayout>
        <div className="relative h-[calc(100vh-64px)]">
          {/* Main chat interface */}
          <ChatInterface userRole="student" />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 