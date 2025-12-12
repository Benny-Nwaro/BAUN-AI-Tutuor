'use client';

import React from 'react';
import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

type QuickQuizProps = {
  topic: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
};

export default function QuickQuiz({ topic, questions, onComplete }: QuickQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === currentQuestion.correctAnswerIndex) {
      setCorrectAnswers(prev => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(correctAnswers, questions.length);
      }
    }
  };
  
  const getScoreMessage = () => {
    const percentage = (correctAnswers / questions.length) * 100;
    if (percentage === 100) return "Perfect! You've mastered this concept!";
    if (percentage >= 80) return "Great job! You have a strong understanding.";
    if (percentage >= 60) return "Good work! Keep practicing to improve.";
    return "Keep learning! Review the concept and try again.";
  };

  return (
    <div className="mt-3 sm:mt-4 mb-2 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30 overflow-hidden w-full max-w-full">
      <div className="px-3 py-2 bg-primary/20 dark:bg-primary/30 flex justify-between items-center">
        <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {quizCompleted ? "Quiz Results" : `Quick Quiz: ${topic}`}
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">
          {!quizCompleted && `Question ${currentQuestionIndex + 1}/${questions.length}`}
        </span>
      </div>
      
      <div className="p-3 max-h-[60vh] overflow-y-auto">
        {!quizCompleted ? (
          <>
            <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 break-words">
              {currentQuestion.question}
            </p>
            
            <div className="space-y-2 mb-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm transition duration-150 border ${
                    selectedAnswer === index
                      ? isAnswered
                        ? index === currentQuestion.correctAnswerIndex
                          ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                          : "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                        : "bg-primary/20 dark:bg-primary/30 border-primary/30 dark:border-primary/40"
                      : isAnswered
                      ? index === currentQuestion.correctAnswerIndex
                        ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
                        : "bg-white dark:bg-zinc-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                      : "bg-white dark:bg-zinc-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  }`}
                  disabled={isAnswered}
                >
                  <div className="flex items-center">
                    <span className="flex-1 break-words">{option}</span>
                    {isAnswered && selectedAnswer === index && (
                      index === currentQuestion.correctAnswerIndex ? (
                        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 ml-2" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 ml-2" />
                      )
                    )}
                    {isAnswered && selectedAnswer !== index && index === currentQuestion.correctAnswerIndex && (
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {isAnswered && (
              <div className="mb-3 p-2 bg-gray-50 dark:bg-zinc-800 rounded-md text-xs sm:text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                <p className="font-medium mb-1">
                  {selectedAnswer === currentQuestion.correctAnswerIndex ? (
                    <span className="text-green-600 dark:text-green-400">Correct!</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">Not quite right</span>
                  )}
                </p>
                <p className="break-words">{currentQuestion.explanation}</p>
              </div>
            )}
            
            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className="w-full px-3 py-2 bg-primary hover:bg-primary-dark text-black rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold mb-2 text-primary dark:text-primary">
              {correctAnswers} / {questions.length}
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3">
              {getScoreMessage()}
            </p>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary dark:bg-primary" 
                style={{ width: `${(correctAnswers / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 