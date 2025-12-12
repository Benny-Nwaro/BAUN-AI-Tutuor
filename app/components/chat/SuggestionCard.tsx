'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

type SuggestionCardProps = {
  title: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
};

export default function SuggestionCard({ 
  title, 
  suggestions, 
  onSuggestionClick 
}: SuggestionCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full mr-3">
          <SparklesIcon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="grid gap-2 mt-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-gray-700 dark:text-gray-200"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
} 