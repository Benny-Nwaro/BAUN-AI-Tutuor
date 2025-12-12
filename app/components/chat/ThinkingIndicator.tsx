'use client';

import React, { useEffect, useState } from 'react';

export default function ThinkingIndicator() {
  const [dots, setDots] = useState<number>(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0 mr-3">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
          AI
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-md">
        <div className="flex items-center">
          <span className="text-gray-600 dark:text-gray-300 text-sm">Thinking</span>
          <span className="w-8 text-gray-600 dark:text-gray-300 text-sm">
            {'.'.repeat(dots)}
          </span>
          <div className="ml-2 flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 