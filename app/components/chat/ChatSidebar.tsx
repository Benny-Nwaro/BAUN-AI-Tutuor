'use client';

import React, { useState } from 'react';
import { PlusIcon, TrashIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Conversation } from '@/app/context/ChatContext';
import Button from '../common/Button';

type ChatSidebarProps = {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onClose?: () => void;
  userRole: 'student' | 'teacher';
};

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose,
  userRole,
}: ChatSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  // Filter conversations based on userRole
  const roleConversations = conversations.filter(
    conversation => conversation.userRole === userRole
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-medium text-gray-900 dark:text-white">Conversations</h2>
        <button 
          className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4">
        <Button
          fullWidth
          onClick={onNewConversation}
          icon={<PlusIcon className="h-5 w-5" />}
        >
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {roleConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No conversations yet. Start a new one!
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {roleConversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 
                  ${currentConversationId === conversation.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                onClick={() => {
                  onSelectConversation(conversation.id);
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <div className="truncate flex-1 mr-2">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {conversation.title}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(conversation.lastUpdated)} • {conversation.userRole === 'student' ? 'AI Tutor' : 'Teaching Assistant'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 