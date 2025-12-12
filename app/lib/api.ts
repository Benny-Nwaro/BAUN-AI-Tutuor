/**
 * API client for chat functionality
 */

import { v4 as uuidv4 } from 'uuid';
import { saveConversation, getConversations as getLocalConversations } from '@/app/lib/indexedDb';
import { Message, Conversation } from '@/app/lib/types';
import { aiManager } from '@/app/lib/aiManager';

// Mock AI response for offline mode
export const getOfflineAIResponse = (message: string, userRole: 'student' | 'teacher' | null): string => {
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
};

// Format messages for OpenAI API
const formatMessagesForOpenAI = (messages: Message[]): Array<{ role: string; content: string }> => {
  return messages.map(message => ({
    role: message.role === 'user' ? 'user' : 'assistant',
    content: message.content
  }));
};

// Chat API client
export const chatApi = {
  // Send a message to the AI and get a response
  sendMessage: async (
    message: string,
    conversationId: string,
    userRole: 'student' | 'teacher' | null,
    userId?: string | null
  ): Promise<{ 
    response: string; 
    messageId: string;
    responseId: string;
    offline?: boolean;
    error?: boolean;
  }> => {
    const messageId = uuidv4();
    const responseId = uuidv4();
    
    try {
      // Get conversation to extract message history
      const localConversations = await getLocalConversations();
      const conversation = localConversations.find(conv => conv.id === conversationId);
      
      // Get the last 10 messages for context if available
      const messageHistory = conversation?.messages?.slice(-10) || [];
      
      // Format message history for API
      const formattedHistory = formatMessagesForOpenAI(messageHistory);
      
      try {
        // Use the aiManager to get a response - it handles offline mode, local LLM, and Groq
        const response = await aiManager.generateResponse(
          message, 
          userRole, 
          formattedHistory, 
          userId || conversation?.userId || null
        );
        
        return {
          response,
          messageId,
          responseId,
          offline: !navigator.onLine
        };
      } catch (error: any) {
        console.error('Error generating response:', error);
        
        return {
          response: `Sorry, I'm having trouble generating a response right now. ${error.message || 'Please try again later.'}`,
          messageId,
          responseId,
          error: true
        };
      }
    } catch (error: any) {
      console.error('Error sending message to API:', error);
      
      return {
        response: `Sorry, I encountered an error while processing your request: ${error.message || 'Unknown error'}`,
        messageId,
        responseId,
        error: true
      };
    }
  },
  
  // Get conversation history with offline support
  getConversations: async (userRole: 'student' | 'teacher' | null, userId?: string | null): Promise<Conversation[]> => {
    try {
      console.log(`API getConversations called with role: ${userRole}, userId: ${userId || 'null'}`);
      
      // Get local conversations
      const localConversations = await getLocalConversations();
      console.log(`Retrieved ${localConversations.length} local conversations`);
      
      // Filter conversations by role if provided
      let filteredConversations = localConversations;
      if (userRole) {
        // Filter conversations that match the current role
        filteredConversations = localConversations.filter(conv => {
          // Check if the conversation has a userRole property
          if (conv.userRole !== undefined) {
            const match = conv.userRole === userRole;
            
            if (!match) {
              console.log(`Filtering out conversation ${conv.id} with role ${conv.userRole} (current role: ${userRole})`);
            }
            
            return match;
          }
          
          // For legacy conversations without userRole, exclude them
          console.log(`Conversation ${conv.id} has no userRole property, excluding`);
          return false;
        });
        
        console.log(`Filtered from ${localConversations.length} to ${filteredConversations.length} conversations for role: ${userRole}`);
      }
      
      return filteredConversations;
    } catch (error) {
      console.error('Error in getConversations:', error);
      // Return empty array as fallback
      return [];
    }
  },
  
  // Save a conversation locally
  syncConversation: async (conversation: Conversation): Promise<boolean> => {
    try {
      // Save locally
      await saveConversation(conversation);
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }
}; 
