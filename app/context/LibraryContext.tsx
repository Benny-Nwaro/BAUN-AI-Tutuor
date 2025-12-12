'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Document, documentService } from '@/app/lib/documentService';

type LibraryContextType = {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  searchDocuments: (query: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse dates coming from the server
  const processDocuments = (docs: Document[]) => {
    return docs.map(doc => ({
      ...doc,
      // Convert date string to Date object if it's a string
      uploadedAt: typeof doc.uploadedAt === 'string' ? new Date(doc.uploadedAt) : doc.uploadedAt
    }));
  };

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new direct document service instead of the API route
      const data = await documentService.getAllDocuments();
      setDocuments(processDocuments(data));
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new direct document service instead of the API route
      const newDocument = await documentService.uploadDocument(file);
      setDocuments(prev => [...prev, processDocuments([newDocument])[0]]);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new direct document service instead of the API route
      await documentService.deleteDocument(documentId);
      
      // Remove the document from the state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new direct document service instead of the API route
      const data = await documentService.searchDocuments(query);
      setDocuments(processDocuments(data));
    } catch (err) {
      console.error('Error searching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to search documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LibraryContext.Provider
      value={{
        documents,
        isLoading,
        error,
        uploadDocument,
        deleteDocument,
        searchDocuments,
        refreshDocuments,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
} 