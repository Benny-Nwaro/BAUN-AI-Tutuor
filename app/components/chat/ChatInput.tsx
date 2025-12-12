'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SpeechInput from '../common/SpeechInput';

type ChatInputProps = {
  onSendMessage: (content: string, attachments: string[]) => void;
  isLoading: boolean;
};

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [justSent, setJustSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset justSent flag after a delay
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (justSent) {
      timeout = setTimeout(() => {
        setJustSent(false);
      }, 1500); // Keep send button visible for 1.5 seconds after sending
    }
    return () => clearTimeout(timeout);
  }, [justSent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
      setJustSent(true); // Set flag to indicate a message was just sent
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setAttachments(prev => [...prev, ...fileNames]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleSpeechResult = (text: string) => {
    // Append the transcribed text to the current message
    setMessage((prev) => {
      const newMessage = prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + text;
      
      // Auto-resize the textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
      }, 0);
      
      return newMessage;
    });
    
    // Focus the textarea
    textareaRef.current?.focus();
  };

  // Check if input is empty (no text and no attachments)
  const isInputEmpty = message.trim() === '' && attachments.length === 0;
  
  // Show send button if there's input OR a message was just sent OR a response is loading
  const showSendButton = !isInputEmpty || justSent || isLoading;

  return (
    <div className="w-full mx-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-lg">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3 mb-1">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-800 dark:text-gray-200"
            >
              <span className="truncate max-w-[150px]">{file}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(index)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto px-4 py-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          placeholder="Message Buan AI..."
          rows={1}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 pr-24 sm:pr-24 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm min-h-[50px] max-h-[150px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {/* Attachments button - always visible */}
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => fileInputRef.current?.click()}
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          
          {/* Toggle between mic and send button based on input state, justSent flag, and loading state */}
          {showSendButton ? (
            /* Show send button when input has text or a message was just sent or is loading */
            <button
              type="submit"
              disabled={isInputEmpty && !justSent && !isLoading}
              className={`p-1.5 rounded-md transition-opacity duration-200 ${
                isLoading 
                  ? 'bg-primary/90 hover:bg-primary-light/90 text-white' // Loading state styling
                  : isInputEmpty && justSent 
                    ? 'bg-primary/70 hover:bg-primary-light/70 text-white' // Just sent but empty input
                    : 'bg-primary hover:bg-primary-light text-white' // Normal state
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 rounded-full animate-spin border-2 border-solid border-current border-t-transparent"></div>
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          ) : (
            /* Show mic when input is empty, not loading, and no message was just sent */
            <SpeechInput 
              onTextReceived={handleSpeechResult}
              variant="ghost"
              size="sm"
            />
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </div>
      </form>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 pb-2">
        Shift + Enter for new line | Enter to send
      </p>
    </div>
  );
} 