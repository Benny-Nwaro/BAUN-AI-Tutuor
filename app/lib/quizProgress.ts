/**
 * Simple utility for tracking quiz progress locally
 */

// Types
export interface QuizResult {
  topic: string;
  score: number;
  total: number;
  timestamp: string;
}

export interface TopicStats {
  topic: string;
  quizzesTaken: number;
  averageScore: number;
  lastQuizDate: string;
}

// Constants
const QUIZ_RESULTS_KEY = 'baun-quiz-results';

// Save a quiz result to local storage
export function saveQuizResult(topic: string, score: number, total: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing results
    const existingResults = getQuizResults();
    
    // Add new result
    const newResult: QuizResult = {
      topic,
      score,
      total,
      timestamp: new Date().toISOString()
    };
    
    // Save updated results
    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify([...existingResults, newResult]));
  } catch (error) {
    console.error('Error saving quiz result:', error);
  }
}

// Get all quiz results from local storage
export function getQuizResults(): QuizResult[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedResults = localStorage.getItem(QUIZ_RESULTS_KEY);
    if (storedResults) {
      return JSON.parse(storedResults);
    }
  } catch (error) {
    console.error('Error retrieving quiz results:', error);
  }
  
  return [];
}

// Get stats for a specific topic
export function getTopicStats(topic: string): TopicStats | null {
  const results = getQuizResults();
  const topicResults = results.filter(result => result.topic === topic);
  
  if (topicResults.length === 0) return null;
  
  // Calculate average score
  const totalScore = topicResults.reduce((sum, result) => sum + (result.score / result.total), 0);
  const averageScore = totalScore / topicResults.length;
  
  // Find the most recent quiz date
  const dates = topicResults.map(result => new Date(result.timestamp));
  const lastQuizDate = new Date(Math.max(...dates.map(date => date.getTime()))).toISOString();
  
  return {
    topic,
    quizzesTaken: topicResults.length,
    averageScore,
    lastQuizDate
  };
}

// Get overall quiz stats
export function getOverallStats(): {
  totalQuizzesTaken: number;
  uniqueTopics: number;
  bestTopic: string | null;
  worstTopic: string | null;
} {
  const results = getQuizResults();
  
  if (results.length === 0) {
    return {
      totalQuizzesTaken: 0,
      uniqueTopics: 0,
      bestTopic: null,
      worstTopic: null
    };
  }
  
  // Get unique topics
  const topics = [...new Set(results.map(result => result.topic))];
  
  // Get stats for each topic
  const topicStats = topics.map(topic => {
    const stats = getTopicStats(topic);
    return stats ? { topic, score: stats.averageScore } : null;
  }).filter(Boolean) as { topic: string; score: number }[];
  
  // Sort by score
  topicStats.sort((a, b) => b.score - a.score);
  
  return {
    totalQuizzesTaken: results.length,
    uniqueTopics: topics.length,
    bestTopic: topicStats.length > 0 ? topicStats[0].topic : null,
    worstTopic: topicStats.length > 0 ? topicStats[topicStats.length - 1].topic : null
  };
} 