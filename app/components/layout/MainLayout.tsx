'use client';

import React from 'react';
import Navbar from './Navbar';
import NetworkStatus from '../common/NetworkStatus';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 sm:pt-16 px-2 sm:px-0">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <NetworkStatus />
    </div>
  );
} 