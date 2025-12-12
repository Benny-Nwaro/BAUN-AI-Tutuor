'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useLibrary } from '@/app/context/LibraryContext';
import DocumentList from './DocumentList';
import DocumentUpload from './DocumentUpload';

type LibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'student' | 'teacher';
};

export default function LibraryModal({ isOpen, onClose, userRole }: LibraryModalProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    documents,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    searchDocuments,
    refreshDocuments
  } = useLibrary();

  // Initial load of documents when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshDocuments();
      
      // Reset search when modal is opened
      setSearchQuery('');
    }
  }, [isOpen, refreshDocuments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        if (searchQuery.trim()) {
          searchDocuments(searchQuery);
        } else {
          refreshDocuments();
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchDocuments, refreshDocuments, isOpen]);

  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(file);
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload failed:', err);
      // Error is handled by the LibraryContext and displayed in the UI
    }
  };

  const handleDelete = async (document: any) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      try {
        await deleteDocument(document.id);
      } catch (err) {
        console.error('Delete failed:', err);
        // Error is handled by the LibraryContext and displayed in the UI
      }
    }
  };

  const handleView = (document: any) => {
    // The DocumentList component now handles opening the document in a new tab
    console.log('Viewing document:', document.id);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Document Library"
      size="lg"
    >
      <div className="flex flex-col h-[70vh]">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Upload Button (Teacher only) */}
          {userRole === 'teacher' && (
            <div>
              <Button
                onClick={() => setShowUploadModal(true)}
                icon={<ArrowUpTrayIcon className="h-5 w-5" />}
              >
                Upload Document
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Document List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              userRole={userRole}
              onView={handleView}
              onDelete={userRole === 'teacher' ? handleDelete : undefined}
            />
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="md"
      >
        <DocumentUpload
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      </Modal>
    </Modal>
  );
} 