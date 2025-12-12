'use client';

import MainLayout from '../components/layout/MainLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <LoginForm />
      </div>
    </MainLayout>
  );
} 