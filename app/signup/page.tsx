'use client';

import MainLayout from '../components/layout/MainLayout';
import SignupForm from '../components/auth/SignupForm';

export default function SignupPage() {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <SignupForm />
      </div>
    </MainLayout>
  );
} 