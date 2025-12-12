/**
 * Groq API integration for Baun AI Tutor
 */

// We don't need to import and initialize Groq here anymore
// This file will be used on the client side, which doesn't have access to the GROQ_API_KEY
import { updateProfileFromMessage } from './learnerProfile';

export const groqService = {
  /**
   * Generate a response using Groq's API via our server endpoint
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
    try {
      // If this is a student and we have a userId, update their learner profile
      if (userRole === 'student' && userId) {
        // Detect the topic from the message (very basic implementation)
        let detectedTopic = '';
        
        // Look for common subject indicators
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('math') || lowerMessage.includes('equation') || 
            lowerMessage.includes('algebra') || lowerMessage.includes('calculus')) {
          detectedTopic = 'Mathematics';
        } else if (lowerMessage.includes('physics') || lowerMessage.includes('force') || 
                  lowerMessage.includes('energy') || lowerMessage.includes('motion')) {
          detectedTopic = 'Physics';
        } else if (lowerMessage.includes('chemistry') || lowerMessage.includes('molecule') || 
                  lowerMessage.includes('atom') || lowerMessage.includes('reaction')) {
          detectedTopic = 'Chemistry';
        } else if (lowerMessage.includes('biology') || lowerMessage.includes('cell') || 
                  lowerMessage.includes('organism') || lowerMessage.includes('ecosystem')) {
          detectedTopic = 'Biology';
        } else if (lowerMessage.includes('history') || lowerMessage.includes('century') || 
                  lowerMessage.includes('war') || lowerMessage.includes('civilization')) {
          detectedTopic = 'History';
        } else if (lowerMessage.includes('programming') || lowerMessage.includes('code') || 
                  lowerMessage.includes('function') || lowerMessage.includes('algorithm')) {
          detectedTopic = 'Computer Science';
        } else if (lowerMessage.includes('literature') || lowerMessage.includes('poem') || 
                  lowerMessage.includes('novel') || lowerMessage.includes('character')) {
          detectedTopic = 'Literature';
        }
        
        // Update the learner profile
        updateProfileFromMessage(userId, message, detectedTopic);
      }
      
      // Call the Groq API endpoint directly (no local LLM fallback)
      const response = await fetch('/ai/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userRole,
          messageHistory,
          userId  // Pass the userId to the API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API error response:', errorData);
        throw new Error(errorData.error || `Failed to generate response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating response from Groq service:', error);
      throw error; // Propagate the error to be handled by the caller
    }
  }
}; 