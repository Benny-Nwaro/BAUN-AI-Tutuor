'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, AcademicCapIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/app/context/ChatContext';
import { extractTopicsFromContent, generateQuizQuestions, isContentQuizWorthy } from '@/app/lib/quizGenerator';
import { QuizQuestion } from './QuickQuiz';
import QuickQuiz from './QuickQuiz';
import { getOverallStats, getQuizResults, TopicStats, getTopicStats } from '@/app/lib/quizProgress';
import Modal from '../common/Modal';

type QuizModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const { currentConversation } = useChat();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizTopic, setQuizTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStats, setQuizStats] = useState<{
    totalQuizzesTaken: number;
    uniqueTopics: number;
    bestTopic: string | null;
    worstTopic: string | null;
  }>({ totalQuizzesTaken: 0, uniqueTopics: 0, bestTopic: null, worstTopic: null });
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [showTopicDetails, setShowTopicDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get quiz stats
        const stats = getOverallStats();
        setQuizStats(stats);
        
        // Get topic-specific stats
        if (stats.uniqueTopics > 0) {
          const quizResults = getQuizResults();
          const topics = [...new Set(quizResults.map(result => result.topic))];
          
          const allTopicStats = topics
            .map(topic => getTopicStats(topic))
            .filter(Boolean) as TopicStats[];
          
          // Sort by most recent
          allTopicStats.sort((a, b) => 
            new Date(b.lastQuizDate).getTime() - new Date(a.lastQuizDate).getTime()
          );
          
          setTopicStats(allTopicStats);
        }
        
        // Generate a quiz if there's a conversation
        if (currentConversation) {
          generateQuizFromConversation();
        } else {
          setError("No active conversation found. Start a chat to generate a quiz.");
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load quiz data:', err);
        setError("Failed to generate quiz. Please try again later.");
        setIsLoading(false);
      }
    }
  }, [isOpen, currentConversation]);

  const generateQuizFromConversation = async () => {
    if (!currentConversation) return;
    
    // Get the last few messages for context
    const recentMessages = currentConversation.messages.slice(-5);
    
    // Combine content from recent messages
    const combinedContent = recentMessages
      .map(msg => msg.content)
      .join('\n\n');
    
    // Extract the main topic from the conversation
    const topics = extractTopicsFromContent(combinedContent);
    const mainTopic = topics[0] || 'Recent Learning';
    
    setQuizTopic(mainTopic);
    
    try {
      // Generate quiz questions based on the conversation content
      const questions = await generateQuizQuestions(combinedContent, mainTopic, 3);
      setQuizQuestions(questions);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to generate quiz questions:', err);
      setError("Failed to generate quiz questions. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Learning Quiz" size="md">
      <div className="p-3 sm:p-4 max-h-[80vh] overflow-y-auto">
        {/* Quiz Stats */}
        {quizStats.totalQuizzesTaken === 0 ? (
          <div className="mb-3 sm:mb-4 bg-primary/10 dark:bg-primary/20 rounded-lg p-3 text-center border border-primary/20 dark:border-primary/30">
            <AcademicCapIcon className="h-6 sm:h-8 w-6 sm:w-8 mx-auto text-primary dark:text-primary mb-2" />
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">No Quiz Activity Yet</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              This will be your first quiz!
            </p>
          </div>
        ) : (
          <div className="mb-3 sm:mb-4 bg-primary/10 dark:bg-primary/20 rounded-lg p-3 border border-primary/20 dark:border-primary/30">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <TrophyIcon className="h-5 w-5 text-primary flex-shrink-0" />
                Learning Progress
              </h4>
              <button 
                onClick={() => setShowTopicDetails(!showTopicDetails)}
                className="text-xs text-primary hover:text-primary-dark hover:underline"
              >
                {showTopicDetails ? 'Hide Details' : 'Show Topics'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
              <div className="bg-white dark:bg-zinc-900/50 rounded-md p-2 text-center">
                <div className="text-lg sm:text-xl font-bold text-primary dark:text-primary">
                  {quizStats.totalQuizzesTaken}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Quizzes Completed
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-md p-2 text-center">
                <div className="text-lg sm:text-xl font-bold text-primary dark:text-primary">
                  {quizStats.uniqueTopics}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Topics Explored
                </div>
              </div>
            </div>
            
            {showTopicDetails && topicStats.length > 0 && (
              <div className="mt-3 border-t border-primary/20 dark:border-primary/30 pt-3">
                <h5 className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Recent Topics
                </h5>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {topicStats.slice(0, 3).map((topic) => (
                    <div key={topic.topic} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-800 dark:text-gray-200 truncate max-w-[70%]">{topic.topic}</span>
                        <span className="text-gray-600 dark:text-gray-400">{Math.round(topic.averageScore * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-primary dark:bg-primary h-1.5 rounded-full" 
                          style={{ width: `${Math.round(topic.averageScore * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Quiz Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 sm:py-10">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-black text-sm rounded-md shadow-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-3 sm:mb-4">
              <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                {quizTopic} Quiz
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Test your knowledge based on your recent conversation
              </p>
            </div>
            
            {quizQuestions.length > 0 ? (
              <QuickQuiz 
                questions={quizQuestions}
                topic={quizTopic}
              />
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  No quiz questions generated.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
} 