'use client';

import React, { useEffect, useState } from 'react';
import { getOverallStats, getQuizResults, TopicStats, getTopicStats } from '@/app/lib/quizProgress';
import { AcademicCapIcon, CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function QuizProgress() {
  const [stats, setStats] = useState<{
    totalQuizzesTaken: number;
    uniqueTopics: number;
    bestTopic: string | null;
    worstTopic: string | null;
  }>({ totalQuizzesTaken: 0, uniqueTopics: 0, bestTopic: null, worstTopic: null });
  
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    // Get overall stats
    const overallStats = getOverallStats();
    setStats(overallStats);
    
    // Get topic-specific stats
    if (overallStats.uniqueTopics > 0) {
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
  }, []);
  
  if (stats.totalQuizzesTaken === 0) {
    return (
      <div className="text-center py-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900">
        <AcademicCapIcon className="h-10 w-10 mx-auto text-blue-500 dark:text-blue-400 mb-2" />
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-1">No Quiz Activity Yet</h3>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Complete quizzes to track your learning progress
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 flex justify-between items-center">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
          <TrophyIcon className="h-5 w-5" />
          Learning Progress
        </h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.totalQuizzesTaken}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Quizzes Completed
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.uniqueTopics}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Topics Explored
            </div>
          </div>
        </div>
        
        {stats.bestTopic && (
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Strongest Topic: <span className="text-green-600 dark:text-green-400">{stats.bestTopic}</span>
              </div>
            </div>
          </div>
        )}
        
        {showDetails && topicStats.length > 0 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Topics</h4>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {topicStats.slice(0, 3).map((topic) => (
                <div key={topic.topic} className="bg-gray-50 dark:bg-zinc-900 rounded-md p-3">
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {topic.topic}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.quizzesTaken} {topic.quizzesTaken === 1 ? 'quiz' : 'quizzes'}
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600" 
                      style={{ width: `${Math.round(topic.averageScore * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(topic.averageScore * 100)}% mastery
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 