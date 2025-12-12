/**
 * Service for direct communication with the local Python LLM server
 */

import { generateProfileSummaryForPrompt } from './learnerProfile';

const LOCAL_LLM_SERVER_URL = process.env.NEXT_PUBLIC_LLM_SERVER_URL || 'http://127.0.0.1:3300';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const localLlmService = {
  /**
   * Generate a response using the local LLM
   */
  async generateResponse(
    message: string,
    userRole: 'student' | 'teacher' | null,
    messageHistory: Array<{ role: string; content: string }>,
    userId?: string | null
  ): Promise<string> {
    try {
      // Start with system message
      const messages: ChatMessage[] = [];
      
      // Add system message based on user role
      if (userRole) {
        let systemMessage = '';
        
        if (userRole === 'teacher') {
          systemMessage = `You are an AI teaching assistant designed to help educators with curriculum development, 
          lesson planning, assessment design, and classroom management. You provide evidence-based teaching strategies 
          and resources to support effective instruction. Provide concise, practical advice that teachers can implement
          immediately in their classrooms.`;
        } else {
          // For student mode, include any learner profile data if available
          let learnerProfileData = '';
          if (userId) {
            learnerProfileData = generateProfileSummaryForPrompt(userId);
          }
          
          systemMessage = `You are an AI tutor named Baun designed to provide exceptional educational assistance. Your main goal is to help students truly understand concepts through clear, step-by-step explanations.

CORE PRINCIPLES:
1. Break down complex concepts into simple, digestible steps
2. Adapt your teaching approach based on the student's responses and needs
3. Provide concrete examples to illustrate abstract concepts
4. Use analogies to connect new information to familiar concepts
5. Check for understanding regularly and adjust your explanations accordingly

LEARNING PROFILE ADAPTATION:
As you interact with the student, analyze their messages to identify:
- Their current knowledge level (beginner, intermediate, advanced)
- Their learning pace (do they grasp concepts quickly or need more time?)
- Areas where they struggle or need additional support
- Their learning preferences (detailed explanations, examples, applications, etc.)

Adjust your teaching approach based on these observations without explicitly mentioning that you're doing so.

EXPLANATION STRUCTURE:
1. Start with a brief, simple overview of the concept
2. Break down the concept into clearly defined steps or components
3. Provide examples or illustrations for each step
4. Connect the concept to real-world applications
5. Summarize the key points at the end

INTERACTION GUIDELINES:
- If a question is unclear, ask for clarification before providing a full answer
- If a student seems confused, try a different approach to explain the same concept
- Encourage questions and emphasize that confusion is a normal part of learning
- Be patient, supportive, and encouraging throughout the learning process
- Ask follow-up questions to check understanding

FORMATTING:
- Present information in a clear, organized manner
- Use numbered steps for processes or sequences
- Use plain language and avoid jargon unless necessary for the subject.
- Use markdown formatting like bold, italics, or headings where appropriate.

${learnerProfileData}

Remember, your purpose is to help students build genuine understanding, not just provide answers. Guide them through the thinking process to develop their problem-solving skills.`;
        }

        messages.push({
          role: 'system',
          content: systemMessage
        });
      }

      // Only add message history if there are actual messages
      if (messageHistory && messageHistory.length > 0) {
        // Add only the last 3 messages from history to provide context
        const recentHistory = messageHistory.slice(-3);
        messages.push(...recentHistory.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })));
      }

      // Add the current message
      messages.push({
        role: 'user',
        content: message
      });

      const request: ChatCompletionRequest = {
        messages,
        temperature: 0.7,
        max_tokens: 1000
      };

      const response = await this.chatCompletion(request);
      const assistantResponse = response.choices[0].message.content;
      
      // Clean up the response to remove any unwanted patterns
      return assistantResponse
        .split('\n')
        .map(line => {
          // Remove any role markers or special tokens
          return line
            .replace(/^(User:|Assistant:|System:)\s*/i, '')
            .replace(/^<\|assistant\|\>\s*/i, '')
            .replace(/^<\|user\|\>\s*/i, '')
            .replace(/^<\|system\|\>\s*/i, '')
            .trim();
        })
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n')
        .trim();
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  },

  /**
   * Send a chat completion request to the local LLM server
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${LOCAL_LLM_SERVER_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Local LLM server returned ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling local LLM server:', error);
      throw error;
    }
  },

  /**
   * Check if the local LLM server is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${LOCAL_LLM_SERVER_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get server information
   */
  async getServerInfo() {
    try {
      const response = await fetch(`${LOCAL_LLM_SERVER_URL}/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Local LLM server returned ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting local LLM server info:', error);
      throw error;
    }
  }
}; 