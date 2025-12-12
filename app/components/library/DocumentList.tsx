'use client';

import React from 'react';
import { DocumentTextIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';

type Document = {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedAt: Date | string;
  uploadedBy: string;
};

type DocumentListProps = {
  documents: Document[];
  userRole: 'student' | 'teacher';
  onView: (document: Document) => void;
  onDelete?: (document: Document) => void;
};

export default function DocumentList({ documents, userRole, onView, onDelete }: DocumentListProps) {
  const formatDate = (date: Date | string) => {
    // Convert to Date if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  };

  const handleView = (document: Document) => {
    // Open the document in a new tab
    window.open(`/api/documents/${document.id}`, '_blank');
    
    // Call the onView callback for any additional handling
    onView(document);
  };

  return (
    <div className="space-y-2">
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {userRole === 'teacher' 
              ? 'No documents yet. Upload your first document!'
              : 'No documents available yet.'}
          </p>
        </div>
      ) : (
        documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <DocumentIcon type={document.type} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {document.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {document.type.toUpperCase()} • {document.size} • {formatDate(document.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleView(document)}
                icon={<EyeIcon className="h-4 w-4" />}
              >
                View
              </Button>
              {userRole === 'teacher' && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(document)}
                  icon={<TrashIcon className="h-4 w-4" />}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Helper component to display different icons based on file type
function DocumentIcon({ type }: { type: string }) {
  // Default to DocumentTextIcon
  let icon = <DocumentTextIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />;
  
  // Add specific colors based on file type
  let className = "h-8 w-8 ";
  
  switch (type.toLowerCase()) {
    case 'pdf':
      className += "text-red-400 dark:text-red-500";
      break;
    case 'doc':
    case 'docx':
      className += "text-blue-400 dark:text-blue-500";
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
      className += "text-green-400 dark:text-green-500";
      break;
    case 'txt':
    case 'md':
      className += "text-gray-400 dark:text-gray-500";
      break;
    default:
      className += "text-gray-400 dark:text-gray-500";
  }
  
  return <DocumentTextIcon className={className} />;
} 