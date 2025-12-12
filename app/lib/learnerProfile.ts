/**
 * Learner Profile Management
 * 
 * This module handles the tracking and storage of learner profiles for adaptive learning.
 * It stores profile data in localStorage to persist across sessions.
 */

// Constants for localStorage keys
const LEARNER_PROFILE_KEY = 'buan-learner-profile';

// Types
export interface LearnerProfile {
  // Basic data
  id: string;
  lastUpdated: string;
  
  // Learning preferences and characteristics
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  learningPace: 'slower' | 'average' | 'faster' | 'unknown';
  learningPreferences: {
    detailedExplanations: number; // 1-10 scale, higher means stronger preference
    examples: number;
    visualLearning: number;
    practicalApplications: number;
    interactiveQuestions: number;
  };
  
  // Subject-specific knowledge
  topics: {
    [key: string]: {
      knowledgeLevel: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
      interactionCount: number;
      lastInteraction: string;
    }
  };
  
  // Historical data
  interactionCount: number;
  questionTypes: {
    factual: number;
    conceptual: number;
    analytical: number;
    applicationBased: number;
  };
  
  // Messaging patterns
  averageMessageLength: number;
  responsePreference: 'concise' | 'detailed' | 'balanced' | 'unknown';
}

/**
 * Create a new learner profile with default values
 * @param id Unique identifier for the learner
 * @returns A new learner profile
 */
export function createLearnerProfile(id: string): LearnerProfile {
  return {
    id,
    lastUpdated: new Date().toISOString(),
    knowledgeLevel: 'unknown',
    learningPace: 'unknown',
    learningPreferences: {
      detailedExplanations: 5,
      examples: 5,
      visualLearning: 5,
      practicalApplications: 5,
      interactiveQuestions: 5
    },
    topics: {},
    interactionCount: 0,
    questionTypes: {
      factual: 0,
      conceptual: 0,
      analytical: 0,
      applicationBased: 0
    },
    averageMessageLength: 0,
    responsePreference: 'unknown'
  };
}

/**
 * Get the current learner profile from localStorage
 * @param userId The user ID to use for the profile
 * @returns The learner profile or a new default profile if none exists
 */
export function getLearnerProfile(userId: string): LearnerProfile {
  if (typeof window === 'undefined') {
    return createLearnerProfile(userId);
  }
  
  try {
    const storedProfile = localStorage.getItem(LEARNER_PROFILE_KEY);
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      
      // If the stored profile has a different user ID, create a new one
      if (profile.id !== userId) {
        const newProfile = createLearnerProfile(userId);
        saveLearnerProfile(newProfile);
        return newProfile;
      }
      
      return profile;
    }
    
    // If no profile exists, create a new one
    const newProfile = createLearnerProfile(userId);
    saveLearnerProfile(newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error retrieving learner profile:', error);
    
    // In case of error, return a fresh profile
    const newProfile = createLearnerProfile(userId);
    saveLearnerProfile(newProfile);
    return newProfile;
  }
}

/**
 * Save the learner profile to localStorage
 * @param profile The profile to save
 */
export function saveLearnerProfile(profile: LearnerProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Update the last updated timestamp
    profile.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(LEARNER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving learner profile:', error);
  }
}

/**
 * Update the learner profile based on a new user message
 * @param userId The user ID
 * @param message The user's message
 * @param detectedTopic Optional topic detected in the message
 */
export function updateProfileFromMessage(
  userId: string,
  message: string,
  detectedTopic?: string
): LearnerProfile {
  const profile = getLearnerProfile(userId);
  
  // Update basic interaction data
  profile.interactionCount += 1;
  
  // Update average message length
  const currentTotal = profile.averageMessageLength * (profile.interactionCount - 1);
  profile.averageMessageLength = (currentTotal + message.length) / profile.interactionCount;
  
  // Update topic-specific data if a topic was detected
  if (detectedTopic && detectedTopic.trim() !== '') {
    if (!profile.topics[detectedTopic]) {
      profile.topics[detectedTopic] = {
        knowledgeLevel: 'unknown',
        interactionCount: 0,
        lastInteraction: new Date().toISOString()
      };
    }
    
    profile.topics[detectedTopic].interactionCount += 1;
    profile.topics[detectedTopic].lastInteraction = new Date().toISOString();
  }
  
  // Analyze question type (very basic analysis)
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('what is') || lowerMessage.includes('who is') || lowerMessage.includes('when did')) {
    profile.questionTypes.factual += 1;
  } else if (lowerMessage.includes('why') || lowerMessage.includes('how does')) {
    profile.questionTypes.conceptual += 1;
  } else if (lowerMessage.includes('analyze') || lowerMessage.includes('compare') || lowerMessage.includes('evaluate')) {
    profile.questionTypes.analytical += 1;
  } else if (lowerMessage.includes('apply') || lowerMessage.includes('use') || lowerMessage.includes('implement')) {
    profile.questionTypes.applicationBased += 1;
  }
  
  // Infer response preference based on message length patterns
  if (profile.interactionCount > 5) {
    if (profile.averageMessageLength < 50) {
      profile.responsePreference = 'concise';
    } else if (profile.averageMessageLength > 150) {
      profile.responsePreference = 'detailed';
    } else {
      profile.responsePreference = 'balanced';
    }
  }
  
  // Save the updated profile
  saveLearnerProfile(profile);
  
  return profile;
}

/**
 * Update the learner profile based on the AI's interpretation of the learner
 * @param userId The user ID
 * @param updates The updates to apply to the profile
 */
export function updateProfileWithAIInsights(
  userId: string,
  updates: Partial<LearnerProfile>
): LearnerProfile {
  const profile = getLearnerProfile(userId);
  
  // Apply updates
  const updatedProfile = {
    ...profile,
    ...updates,
    // Preserve nested objects with merging
    learningPreferences: {
      ...profile.learningPreferences,
      ...(updates.learningPreferences || {})
    },
    questionTypes: {
      ...profile.questionTypes,
      ...(updates.questionTypes || {})
    },
    // Only merge topics that are provided, don't overwrite the entire object
    topics: {
      ...profile.topics,
      ...(updates.topics || {})
    }
  };
  
  // Save the updated profile
  saveLearnerProfile(updatedProfile);
  
  return updatedProfile;
}

/**
 * Generate a profile summary for inclusion in the AI prompt
 * @param userId The user ID
 * @returns A string summarizing the learner profile for the AI
 */
export function generateProfileSummaryForPrompt(userId: string): string {
  const profile = getLearnerProfile(userId);
  
  // Only generate a meaningful summary after enough interactions
  if (profile.interactionCount < 3) {
    return '';
  }
  
  let summary = 'LEARNER PROFILE:\n';
  
  // Add knowledge level if known
  if (profile.knowledgeLevel !== 'unknown') {
    summary += `- Knowledge level: ${profile.knowledgeLevel}\n`;
  }
  
  // Add learning pace if known
  if (profile.learningPace !== 'unknown') {
    summary += `- Learning pace: ${profile.learningPace}\n`;
  }
  
  // Add response preference if known
  if (profile.responsePreference !== 'unknown') {
    summary += `- Prefers ${profile.responsePreference} responses\n`;
  }
  
  // Add learning preferences
  summary += '- Learning preferences: ';
  const preferences = [];
  if (profile.learningPreferences.detailedExplanations > 7) preferences.push('detailed explanations');
  if (profile.learningPreferences.examples > 7) preferences.push('numerous examples');
  if (profile.learningPreferences.visualLearning > 7) preferences.push('visual learning');
  if (profile.learningPreferences.practicalApplications > 7) preferences.push('practical applications');
  if (profile.learningPreferences.interactiveQuestions > 7) preferences.push('interactive questions');
  
  summary += preferences.length > 0 
    ? preferences.join(', ') 
    : 'balanced approach';
  
  summary += '\n';
  
  // Add top topics if any
  const topTopics = Object.entries(profile.topics)
    .sort((a, b) => b[1].interactionCount - a[1].interactionCount)
    .slice(0, 3);
  
  if (topTopics.length > 0) {
    summary += '- Topics of interest: ';
    summary += topTopics.map(([topic]) => topic).join(', ');
    summary += '\n';
  }
  
  return summary;
}

/**
 * Clear the learner profile from localStorage
 */
export function clearLearnerProfile(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(LEARNER_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing learner profile:', error);
  }
} 