export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailConfirmed: boolean;
}

export interface GuestUser {
  id: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  userRole?: UserRole;
  userId?: string;
} 