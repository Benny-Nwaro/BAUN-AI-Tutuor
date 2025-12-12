'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useChat } from '@/app/context/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import SuggestionCard from './SuggestionCard';
import ThinkingIndicator from './ThinkingIndicator';

type ChatInterfaceProps = {
  userRole: 'student' | 'teacher';
};

export default function ChatInterface({ userRole }: ChatInterfaceProps) {
  const {
    conversations,
    currentConversation,
    isLoading,
    createNewConversation,
    setCurrentConversationById,
    addMessage,
    deleteConversation,
    isOffline,
    suggestedPrompts,
  } = useChat();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socraticLevel, setSocraticLevel] = useState(2); // Default = Balanced
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, isLoading]);

  // Initialize correct conversation on mount
  useEffect(() => {
    if (conversations.length > 0 && !currentConversation && userRole) {
      const roleConversations = conversations.filter(conv => conv.userRole === userRole);
      
      if (roleConversations.length > 0) {
        setCurrentConversationById(roleConversations[0].id);
      } else {
        createNewConversation(userRole);
      }
    } else if (!currentConversation && userRole) {
      createNewConversation(userRole);
    }
  }, [conversations, currentConversation, createNewConversation, setCurrentConversationById, userRole]);

  // Updated to include socraticLevel in the message
  const handleSendMessage = (content: string, attachments: string[] = []) => {
    if (!currentConversation) {
      createNewConversation(userRole);
      setTimeout(() => {
        addMessage(content, attachments, socraticLevel);
      }, 0);
    } else {
      addMessage(content, attachments, socraticLevel);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  const handleNewConversation = () => {
    createNewConversation(userRole);
    setSidebarOpen(false);
  };
  
  const getRoleTitle = () => {
    return userRole === 'student' ? 'Buan AI Tutor' : 'Buan AI Teaching Assistant';
  };

  const socraticLabel = {
    1: "Gentle",
    2: "Balanced",
    3: "Strict"
  }[socraticLevel];

  return (
    <div className="relative h-full flex flex-col lg:flex-row">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-80 lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversation?.id || null}
          onSelectConversation={setCurrentConversationById}
          onNewConversation={handleNewConversation}
          onDeleteConversation={deleteConversation}
          onClose={() => setSidebarOpen(false)}
          userRole={userRole}
        />
      </div>
      
      {/* Main chat */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white hidden md:block">
              {currentConversation?.title || getRoleTitle()}
            </h2>
          </div>
          
          <button
            onClick={handleNewConversation}
            className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary text-sm gap-1.5 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>

        {/* 🌟 SOCratic Slider UI */}
        {userRole === "student" && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-zinc-800">
            <label className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Socratic Mode
              </span>
              <span className="text-sm text-primary font-semibold">{socraticLabel}</span>
            </label>
            
            <input
              type="range"
              min={1}
              max={3}
              value={socraticLevel}
              onChange={(e) => setSocraticLevel(Number(e.target.value))}
              className="
                w-full h-2 rounded-lg appearance-none cursor-pointer
                bg-gradient-to-r from-green-400 via-yellow-400 to-red-500
                accent-primary
              "
            />
            
            <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
              <span>Gentle</span>
              <span>Balanced</span>
              <span>Strict</span>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 p-4 pb-36">
          {currentConversation && currentConversation.messages.length > 0 ? (
            <>
              {currentConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-md w-full px-4">
                <SuggestionCard
                  title={userRole === 'student' ? "What would you like to learn today?" : "How can I help with your teaching?"}
                  suggestions={suggestedPrompts}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

