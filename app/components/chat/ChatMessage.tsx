'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import type { Message, Conversation } from '@/app/context/ChatContext';
import { DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import SimpleMarkdown from '../common/SimpleMarkdown';
import { useChat } from '@/app/context/ChatContext';

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const { currentConversation } = useChat();

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className={`flex w-full mb-4 animate-fade-in ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary text-black rounded-tr-none'
            : isError
              ? 'bg-amber-50 dark:bg-amber-900/30 text-gray-900 dark:text-gray-100 rounded-tl-none border border-amber-200 dark:border-amber-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
        }`}
      >
        <div className="flex flex-col w-full">
          {/* Show error icon for error messages */}
          {isError && (
            <div className="flex items-center mb-2 text-amber-600 dark:text-amber-400">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Notice</span>
            </div>
          )}
          
          {/* For user messages, we just display the content as-is without markdown */}
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            /* For AI messages, we render with SimpleMarkdown */
            <SimpleMarkdown 
              content={message.content} 
              className={isUser 
                ? "text-black" 
                : isError 
                  ? "text-gray-900 dark:text-amber-100" 
                  : "text-gray-900 dark:text-gray-100"
              }
            />
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs mb-1">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-200"
                  >
                    <DocumentIcon className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[120px]">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div
            className={`text-xs mt-1 ${
              isUser ? 'text-gray-600 text-right' : isError ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
} 