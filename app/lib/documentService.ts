/**
 * Document Service for direct client-side communication with the Python backend
 */

// Client-side environment variable
const DOCUMENT_SERVER_URL = process.env.NEXT_PUBLIC_LLM_SERVER_URL || 'http://127.0.0.1:3300';

export interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedAt: string | Date;
  uploadedBy: string;
}

export const documentService = {
  /**
   * Get all documents from the server
   */
  getAllDocuments: async (): Promise<Document[]> => {
    try {
      const response = await fetch(`${DOCUMENT_SERVER_URL}/documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch documents: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  /**
   * Upload a document to the server
   */
  uploadDocument: async (file: File): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${DOCUMENT_SERVER_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload document: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  /**
   * Delete a document from the server
   */
  deleteDocument: async (documentId: string): Promise<void> => {
    try {
      const response = await fetch(`${DOCUMENT_SERVER_URL}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete document: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Download a document from the server
   */
  downloadDocument: async (documentId: string): Promise<Blob> => {
    try {
      const response = await fetch(`${DOCUMENT_SERVER_URL}/documents/${documentId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to download document: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  /**
   * Search for documents on the server
   */
  searchDocuments: async (query: string): Promise<Document[]> => {
    try {
      const response = await fetch(`${DOCUMENT_SERVER_URL}/documents/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to search documents: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  },
}; 