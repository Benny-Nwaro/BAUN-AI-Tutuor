'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Baun AI</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              An AI-powered educational platform designed to help students learn and teachers create effective lesson plans.
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/tutor" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link href="/teaching-assistant" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                  Teaching Assistant
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Baun AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 