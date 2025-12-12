/**
 * AI Manager Service
 * Coordinates between the local LLM service and the Groq service
 */

import { localLlmService } from './localLlm';
import { groqService } from './groq';

const LOCAL_LLM_PREFERRED = process.env.NEXT_PUBLIC_LOCAL_LLM_PREFERRED === 'true';

// AI Manager Service
export const aiManager = {
  /**
   * Generate a response using either local LLM or Groq
   * @param message The user's message
   * @param userRole The user's role (student or teacher)
   * @param messageHistory Previous messages in the conversation
   * @param userId Optional user ID for tracking learner profiles
   * @returns The AI's response
   */
  generateResponse: async (
    message: string,
    userRole: 'student' | 'teacher' | null,
    messageHistory: Array<{ role: string; content: string }>,
    userId?: string | null
  ): Promise<string> => {
    const isOffline = !navigator.onLine;
    
    // Always try local LLM first (regardless of online status)
    // This ensures we prioritize local LLM when it's available
    try {
      console.log('Attempting to use local LLM service');
      return await localLlmService.generateResponse(message, userRole, messageHistory, userId);
    } catch (localError) {
      console.log('Local LLM failed:', localError);
      
      // If offline and local LLM failed, show offline message
      if (isOffline) {
        console.log('Device is offline and local LLM failed - returning offline message');
        return getOfflineAIResponse(message, userRole);
      }
      
      // If online and fallback isn't disabled, try Groq
      const disableGroqFallback = process.env.NEXT_PUBLIC_DISABLE_GROQ_FALLBACK === 'true';
      if (!disableGroqFallback) {
        try {
          console.log('Falling back to Groq service');
          return await groqService.generateResponse(message, userRole, messageHistory, userId);
        } catch (groqError) {
          console.error('Groq API also failed:', groqError);
          return `Sorry, I'm having trouble generating a response. The local LLM failed and the Groq API is also unavailable. Please check your connection or try again later.`;
        }
      } else {
        // Groq fallback is disabled
        return `The local LLM server is not responding and fallback to online services is disabled. Please check that your local LLM server is running correctly.`;
      }
    }
  }
};

// Mock AI response for offline mode
function getOfflineAIResponse(message: string, userRole: 'student' | 'teacher' | null): string {
  const content = message.toLowerCase();
  
  if (userRole === 'teacher') {
    return `I'm currently in offline mode, but I can still help with your teaching needs.
    
When you're back online, I'll be able to provide more detailed assistance with your ${content.includes('lesson') ? 'lesson planning' : 'teaching question'}.

In the meantime, you can continue brainstorming ideas and I'll store our conversation for later reference.`;
  } else {
    return `I'm currently in offline mode, but I can still help with your learning.
    
When you're back online, I'll be able to provide more detailed explanations about ${content.includes('math') ? 'this math problem' : 'this topic'}.

In the meantime, you can continue asking questions and I'll store our conversation for later reference.`;
  }
} 