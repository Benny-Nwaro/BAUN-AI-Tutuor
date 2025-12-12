'use client';

import React from 'react';
import { useState } from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import QuickQuiz, { QuizQuestion } from './QuickQuiz';
import { saveQuizResult } from '@/app/lib/quizProgress';

type QuizButtonProps = {
  topic: string;
  questions: QuizQuestion[];
  className?: string;
};

export default function QuizButton({ topic, questions, className = '' }: QuizButtonProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const handleQuizComplete = (correct: number, total: number) => {
    setScore({ correct, total });
    setQuizCompleted(true);
    
    // Save quiz result
    saveQuizResult(topic, correct, total);
  };

  if (showQuiz) {
    return (
      <div className={`${className} w-full max-w-full`}>
        <QuickQuiz 
          topic={topic} 
          questions={questions} 
          onComplete={handleQuizComplete} 
        />
      </div>
    );
  }

  const buttonClass = quizCompleted
    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30"
    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30";

  return (
    <button
      onClick={() => setShowQuiz(true)}
      className={`${buttonClass} ${className} flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors w-full`}
    >
      <AcademicCapIcon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">
        {quizCompleted ? 
          `Review Quiz (${score.correct}/${score.total})` : 
          `Test your knowledge`
        }
      </span>
    </button>
  );
} 