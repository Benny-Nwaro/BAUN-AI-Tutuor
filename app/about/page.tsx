'use client';

import { AppProvider } from '../context/AppProvider';
import MainLayout from '../components/layout/MainLayout';

export default function AboutPage() {
  return (
    <AppProvider>
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            About Baun AI
          </h1>
          
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Baun AI is dedicated to transforming education by leveraging artificial intelligence to create personalized learning and teaching experiences. 
                We believe that AI can be a powerful tool to enhance education, making it more accessible, engaging, and effective for students and teachers alike.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Our goal is to provide tools that adapt to individual learning styles and teaching approaches, 
                breaking down complex concepts into easy-to-understand explanations for students while helping teachers create compelling lesson plans.
              </p>
            </section>
            
            <section className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">How Baun AI Works</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">For Students</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Baun AI Tutor provides detailed, step-by-step explanations on any topic. 
                  Whether you're stuck on a math problem, trying to understand a scientific concept, 
                  or exploring historical events, our AI tutor breaks down information in a way that's easy to comprehend and remember.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">For Teachers</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Baun AI Teaching Assistant helps educators create comprehensive lesson plans, 
                  generate creative teaching ideas, develop assessments, and manage classroom activities. 
                  It saves time on planning and administrative tasks so teachers can focus more on what matters most: 
                  engaging with students and delivering quality education.
                </p>
              </div>
            </section>
            
            <section className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Data</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Baun AI values your privacy. We're committed to transparency in how we handle your data 
                and provide options for using our platform anonymously. While creating an account offers 
                additional features like conversation history, you can always use Baun AI as a guest.
              </p>
            </section>
          </div>
        </div>
      </MainLayout>
    </AppProvider>
  );
} 