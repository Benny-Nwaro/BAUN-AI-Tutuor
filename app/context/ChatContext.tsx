'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';
import { 
  storeUserData, 
  getUserData, 
  isOnline,
  cleanupMissingRoleConversations,
  getConversations as getLocalConversations,
  saveConversation,
  deleteConversationFromDB
} from '@/app/lib/indexedDb';
import { chatApi } from '@/app/lib/api';
import { getRoleFromURL } from '@/app/lib/utils';

// Chat data types
export type Role = 'assistant' | 'user';
export type MessageStatus = 'pending' | 'error' | 'complete';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  userRole: 'student' | 'teacher' | null;
  userId?: string | null;
}

// Context type definition
type ChatContextType = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  currentRole: 'student' | 'teacher' | null;
  suggestedPrompts: string[];
  createNewConversation: (userRole: 'student' | 'teacher') => Promise<string>;
  setCurrentConversationById: (id: string) => void;
  setCurrentRole: (role: 'student' | 'teacher' | null) => void;
  addMessage: (content: string, attachments?: string[]) => Promise<void>;
  updateMessage: (id: string, content: string, status?: MessageStatus) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteAllConversations: () => Promise<void>;
  isOffline: boolean;
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Key constants for storage
const CONVERSATIONS_KEY_PREFIX = 'buan-conversations-';
const CURRENT_CONVERSATION_KEY_PREFIX = 'buan-current-conversation-';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname(); // Get the current pathname for route detection
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<'student' | 'teacher' | null>(null);
  const [isOffline, setIsOffline] = useState(!isOnline());
  
  const studentSuggestions = [
    "Explain the concept of photosynthesis in simple terms",
    "Help me understand how to solve quadratic equations",
    "What are the key events of World War II?",
    "Explain Newton's laws of motion with examples"
  ];
  
  const teacherSuggestions = [
    "Create a lesson plan for teaching linear equations to 8th graders",
    "Suggest activities for teaching the water cycle",
    "How can I explain cellular respiration to high school students?",
    "Generate a rubric for a research paper assignment"
  ];

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(studentSuggestions);

  // Clean up any conversations with missing userRole on component mount
  useEffect(() => {
    const performCleanup = async () => {
      try {
        console.log('Running initial cleanup of conversations with missing roles');
        await cleanupMissingRoleConversations();
      } catch (error) {
        console.error('Error during initial conversation cleanup:', error);
      }
    };
    
    performCleanup();
  }, []);

  // Detect role from URL path on mount
  // This should run before any role-related effect to ensure URL-based roles take precedence
  useEffect(() => {
    const urlRole = getRoleFromURL();
    if (urlRole) {
      console.log(`Setting role from URL: ${urlRole}`);
      setCurrentRole(urlRole);
    }
  }, []);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Update current role when user role changes or when explicitly set
    // But don't override if the role was set by URL detection
    const urlRole = getRoleFromURL();
    if (user?.role && !urlRole) {
      console.log(`Setting role from user: ${user.role}`);
      setCurrentRole(user.role);
    }
  }, [user?.role]);
  
  // Clear current conversation when switching roles
  useEffect(() => {
    if (currentRole && currentConversation && currentConversation.userRole !== currentRole) {
      setCurrentConversation(null);
    }
  }, [currentRole, currentConversation]);

  // Load conversations from storage/server based on the current role
  useEffect(() => {
    // First check for URL-based role
    const urlRole = getRoleFromURL();
    
    // Get the active role (URL role takes highest priority, then user role, then current state)
    const activeRole = urlRole || user?.role || currentRole;
    if (!activeRole) return;

    // Set the current role based on the active role
    setCurrentRole(activeRole);
    
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        console.log(`Loading conversations for role: ${activeRole}, userId: ${user?.id || 'guest'}`);
        
        // Always pass the active role to ensure proper filtering
        const fetchedConversations = await chatApi.getConversations(activeRole, user?.id || null);
        
        console.log(`Fetched ${fetchedConversations.length} conversations for role: ${activeRole}`);
        
        if (fetchedConversations && fetchedConversations.length > 0) {
          // Convert fetched conversations to match our internal format
          const formattedConversations: Conversation[] = fetchedConversations.map(conv => ({
            id: conv.id,
            title: conv.title,
            messages: conv.messages.map(msg => ({
              id: msg.id,
              role: msg.role as Role,
              content: msg.content,
              // Convert string timestamp to Date
              timestamp: new Date(msg.timestamp),
              // Convert API status to our internal status
              status: (msg.status === 'sending' ? 'pending' :
                     msg.status === 'error' ? 'error' :
                     msg.status === 'sent' ? 'complete' :
                     undefined) as MessageStatus | undefined
            })),
            lastUpdated: new Date(conv.lastUpdated),
            // Always explicitly set userRole to activeRole for consistency
            userRole: activeRole,
            userId: conv.userId || user?.id || null
          }));
          
          console.log(`Formatted ${formattedConversations.length} conversations for role: ${activeRole}`);
          setConversations(formattedConversations);
          
          // Try to restore current conversation
          const currentConvKey = `${CURRENT_CONVERSATION_KEY_PREFIX}${activeRole}`;
          const currentConvId = localStorage.getItem(currentConvKey);
          
          console.log(`Current conversation ID from localStorage for ${activeRole}: ${currentConvId}`);
          
          if (currentConvId) {
            const convToSet = formattedConversations.find(c => c.id === currentConvId) || null;
            if (convToSet) {
              console.log(`Restoring current conversation: ${convToSet.id} with ${convToSet.messages.length} messages`);
              setCurrentConversation(convToSet);
            } else {
              console.log(`Could not find conversation with ID: ${currentConvId}`);
              // If the conversation wasn't found, use the most recent one
              if (formattedConversations.length > 0) {
                console.log(`Using most recent conversation instead: ${formattedConversations[0].id}`);
                setCurrentConversation(formattedConversations[0]);
                localStorage.setItem(currentConvKey, formattedConversations[0].id);
              }
            }
          } else if (formattedConversations.length > 0) {
            // If no current conversation is set, use the most recent one
            console.log(`No current conversation ID found, using most recent: ${formattedConversations[0].id}`);
            setCurrentConversation(formattedConversations[0]);
            localStorage.setItem(currentConvKey, formattedConversations[0].id);
          }
        } else {
          console.log(`No conversations found for role: ${activeRole}`);
          // If no conversations found, create a new one automatically
          // Use setTimeout to ensure this happens after the component is fully initialized
          setTimeout(() => {
            console.log(`Creating a new conversation for role: ${activeRole}`);
            createNewConversation(activeRole);
          }, 0);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
    
    // Set suggested prompts based on user role
    // Use URL role detection as first priority
    if (activeRole === 'teacher') {
      setSuggestedPrompts(teacherSuggestions);
    } else {
      setSuggestedPrompts(studentSuggestions);
    }
  }, [user?.role, user?.id]);

  // Save conversations whenever they change
  useEffect(() => {
    const saveConversations = async () => {
      if (conversations.length > 0 && !isLoading) {
        try {
          // Save each conversation individually to ensure proper syncing
          for (const conversation of conversations) {
            // Convert our internal format to the API format
            const apiConversation = {
              id: conversation.id,
              title: conversation.title,
              messages: conversation.messages.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp.toISOString(),
                // Map our status to the expected status in the API
                status: (msg.status === 'pending' ? 'sending' : 
                       msg.status === 'error' ? 'error' : 
                       msg.status === 'complete' ? 'sent' : 
                       undefined) as 'sending' | 'error' | 'sent' | undefined
              })),
              lastUpdated: conversation.lastUpdated.toISOString(),
              userId: conversation.userId,
              userRole: conversation.userRole // Include userRole to ensure it's saved
            };
            
            // Enable this sync call to save conversations locally
            await chatApi.syncConversation(apiConversation as any);
          }
          
          // Save current conversation ID to localStorage
          if (currentConversation) {
            const storageKey = `${CURRENT_CONVERSATION_KEY_PREFIX}${currentRole || user?.role}`;
            localStorage.setItem(storageKey, currentConversation.id);
          }
        } catch (error) {
          console.error('Error saving conversations:', error);
        }
      }
    };
    
    saveConversations();
  }, [conversations, currentConversation, currentRole, user?.role, isLoading]);

  // Create a new conversation
  const createNewConversation = async (userRole: 'student' | 'teacher'): Promise<string> => {
    console.log(`Creating new conversation for role: ${userRole}`);
    
    // Generate a unique ID for the conversation
    const conversationId = uuidv4();
    
    // Determine if this is a guest user
    const isGuestUser = !user?.id || user.id.startsWith('guest-');
    
    // Create the new conversation object
    const newConversation: Conversation = {
      id: conversationId,
      title: 'New Conversation',
      messages: [],
      lastUpdated: new Date(),
      userRole,
      userId: isGuestUser ? `guest-${uuidv4().slice(0, 8)}` : user?.id || null
    };
    
    console.log(`Created conversation with ID: ${newConversation.id}, for user: ${newConversation.userId}`);
    
    // Update the state
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    
    // Save current conversation ID
    const storageKey = `${CURRENT_CONVERSATION_KEY_PREFIX}${userRole}`;
    await storeUserData(storageKey, newConversation.id);
    localStorage.setItem(storageKey, newConversation.id);
    
    // Immediately sync the new conversation to ensure it's saved
    const apiConversation = {
      id: newConversation.id,
      title: newConversation.title,
      messages: [],
      lastUpdated: newConversation.lastUpdated.toISOString(),
      userId: newConversation.userId,
      userRole: userRole // Explicitly include the userRole for storage
    };
    
    // Sync to storage
    console.log(`Syncing new conversation to storage: ${newConversation.id} with role: ${userRole}`);
    await chatApi.syncConversation(apiConversation as any);
    
    return newConversation.id;
  };

  // Set the current conversation by ID
  const setCurrentConversationById = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
      
      // Save current conversation ID
      const activeRole = user?.role || currentRole;
      if (activeRole) {
        storeUserData(`${CURRENT_CONVERSATION_KEY_PREFIX}${activeRole}`, id);
        localStorage.setItem(`${CURRENT_CONVERSATION_KEY_PREFIX}${activeRole}`, id);
      }
    }
  };

  // Add a message to the current conversation
  const addMessage = async (content: string, attachments: string[] = []) => {
    if (!currentConversation) return;
    
    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
        content,
        timestamp: new Date(),
      status: 'complete',
      attachments
    };
    
    // Generate a title from the first user message if this is the first message
    let updatedTitle = currentConversation.title;
    let updatedMessages = [...currentConversation.messages, newMessage];
    
    if (currentConversation.messages.length === 0) {
      // Use the first ~30 chars of the message as the title
      updatedTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }
    
    // Create an updated conversation
    const updatedConversation: Conversation = {
        ...currentConversation,
      title: updatedTitle,
      messages: updatedMessages,
      lastUpdated: new Date()
    };
    
    // Update the current conversation
    setCurrentConversation(updatedConversation);
    
    // Update the conversations list
    setConversations(prevConversations => {
      return prevConversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      );
    });
    
    // If we're online, get an AI response
    if (!isOffline) {
      try {
        setIsLoading(true);
        
        // Call the chatApi to get the AI response
        const { response, responseId } = await chatApi.sendMessage(
          content,
          currentConversation.id,
          currentConversation.userRole,
          currentConversation.userId || user?.id || null
        );
        
        // Add the assistant's response
        const assistantMessage: Message = {
          id: responseId,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          status: 'complete'
        };
        
        // Add to conversation
        const conversationWithResponse = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, assistantMessage],
          lastUpdated: new Date()
        };
        
        // Update state
        setCurrentConversation(conversationWithResponse);
        setConversations(prevConversations => {
          return prevConversations.map(conv => 
            conv.id === currentConversation.id ? conversationWithResponse : conv
          );
        });
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Create an error message for the user
        let errorMessage = "I'm sorry, I encountered an error while processing your request.";
        
        // Check if it's a timeout error
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('abort') || error.message.includes('network')) {
            errorMessage = "I'm sorry, but it's taking me longer than expected to process your request. The local AI model is running on limited hardware and may need more time for complex questions. Please try a simpler question or wait a moment before trying again.";
          } else if (error.message.includes('JSON')) {
            errorMessage = "I received a response but couldn't process it correctly. This could happen when the local AI model is overloaded. Please try a simpler question or wait a moment before trying again.";
          }
        }
        
        // Add the error message as an assistant response
        const errorAssistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          status: 'error'
        };
        
        // Add to conversation
        const conversationWithError = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, errorAssistantMessage],
          lastUpdated: new Date()
        };
        
        // Update state
        setCurrentConversation(conversationWithError);
        setConversations(prevConversations => {
          return prevConversations.map(conv => 
            conv.id === currentConversation.id ? conversationWithError : conv
          );
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // If offline, add a placeholder response about being offline
      const offlineResponse = getOfflineAIResponse(content, currentConversation.userRole);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: offlineResponse,
        timestamp: new Date(),
        status: 'complete'
      };
      
      // Add to conversation
      const conversationWithResponse = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        lastUpdated: new Date()
      };
      
      // Update state
      setCurrentConversation(conversationWithResponse);
      setConversations(prevConversations => {
        return prevConversations.map(conv => 
          conv.id === currentConversation.id ? conversationWithResponse : conv
        );
      });
    }
  };

  // Update a message in the current conversation
  const updateMessage = async (id: string, content: string, status: MessageStatus = 'complete') => {
    if (!currentConversation) return;
    
    // Find and update the message
    const updatedMessages = currentConversation.messages.map(msg => 
      msg.id === id ? { ...msg, content, status, timestamp: new Date() } : msg
    );
    
    // Create an updated conversation
    const updatedConversation: Conversation = {
      ...currentConversation,
      messages: updatedMessages,
      lastUpdated: new Date()
    };
    
    // Update the current conversation
    setCurrentConversation(updatedConversation);
    
    // Update the conversations list
    setConversations(prevConversations => {
      return prevConversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      );
    });
  };

  // Rename a conversation
  const renameConversation = async (id: string, newTitle: string) => {
    // Update the conversations list
    setConversations(prevConversations => {
      return prevConversations.map(conv => 
        conv.id === id ? { ...conv, title: newTitle, lastUpdated: new Date() } : conv
      );
    });
    
    // Update current conversation if it's the one being renamed
    if (currentConversation && currentConversation.id === id) {
      setCurrentConversation({
        ...currentConversation,
        title: newTitle,
        lastUpdated: new Date()
      });
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      // Remove from local storage
      await deleteConversationFromDB(id);
      
      // Update state
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
      
      // Clear current conversation from localStorage if it's the one being deleted
      if (currentRole) {
        const currentConvKey = `${CURRENT_CONVERSATION_KEY_PREFIX}${currentRole}`;
        const currentConvId = localStorage.getItem(currentConvKey);
        if (currentConvId === id) {
          localStorage.removeItem(currentConvKey);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Delete all conversations for the current role
  const deleteAllConversations = async () => {
    const activeRole = user?.role || currentRole;
    if (!activeRole) return;
    
    // Clear conversations for this role
    setConversations(prevConversations => 
      prevConversations.filter(conv => conv.userRole !== activeRole)
    );
    
    // Clear current conversation if it matches the role
    if (currentConversation && currentConversation.userRole === activeRole) {
      setCurrentConversation(null);
      
      // Clear saved current conversation ID
      await storeUserData(`${CURRENT_CONVERSATION_KEY_PREFIX}${activeRole}`, null);
      localStorage.removeItem(`${CURRENT_CONVERSATION_KEY_PREFIX}${activeRole}`);
    }
    
    // Clear saved conversations
    await storeUserData(`${CONVERSATIONS_KEY_PREFIX}${activeRole}`, []);
    localStorage.removeItem(`${CONVERSATIONS_KEY_PREFIX}${activeRole}`);
  };

  // Add the getOfflineAIResponse function from api.ts if needed
  const getOfflineAIResponse = (message: string, userRole: 'student' | 'teacher' | null): string => {
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

  // Monitor route changes to update role based on URL path
  useEffect(() => {
    console.log(`Path changed to: ${pathname}`);
    const urlRole = getRoleFromURL();
    if (urlRole) {
      console.log(`Updating role from URL change: ${urlRole}`);
      setCurrentRole(urlRole);
    }
  }, [pathname]); // This effect runs when the pathname changes

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        currentRole,
        suggestedPrompts,
        createNewConversation,
        setCurrentConversationById,
        setCurrentRole,
        addMessage,
        updateMessage,
        renameConversation,
        deleteConversation,
        deleteAllConversations,
        isOffline
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 