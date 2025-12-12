'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';

type DocumentUploadProps = {
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
};

export default function DocumentUpload({ onUpload, onClose }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
          }`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDragActive
            ? 'Drop the file here'
            : 'Drag and drop a file, or click to select'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          PDF, DOC, DOCX, TXT, MD, JPG, PNG (max 10MB)
        </p>
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {file.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <button
            onClick={removeFile}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || isUploading}
          loading={isUploading}
        >
          Upload
        </Button>
      </div>
    </div>
  );
} 