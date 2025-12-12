'use client';

import React from 'react';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  BookOpenIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface LessonPlanFormProps {
  formData: {
    topic: string;
    gradeLevel: string;
    duration: string;
    standards: string;
    additionalRequirements: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
}

export default function LessonPlanForm({
  formData,
  handleInputChange,
  handleSubmit,
  isGenerating
}: LessonPlanFormProps) {
  const gradeLevels = [
    { value: '', label: 'Select grade level' },
    { value: 'pre-k', label: 'Pre-K' },
    { value: 'k', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' },
    { value: 'college', label: 'College/University' },
  ];

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '2 hours' },
    { value: 'multiple', label: 'Multiple days' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <BookOpenIcon className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
          Lesson Topic or Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleInputChange}
          required
          placeholder="e.g., Photosynthesis, Linear Equations, World War II"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            <AcademicCapIcon className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
            Grade Level <span className="text-red-500">*</span>
          </label>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
          >
            {gradeLevels.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
            Lesson Duration <span className="text-red-500">*</span>
          </label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
          >
            {durations.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="standards" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
          <DocumentTextIcon className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
          Learning Standards (optional)
        </label>
        <input
          type="text"
          id="standards"
          name="standards"
          value={formData.standards}
          onChange={handleInputChange}
          placeholder="e.g., CCSS.ELA-LITERACY.RL.7.1, NGSS.MS-PS1-1"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
        />
      </div>

      <div>
        <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Additional Requirements or Notes (optional)
        </label>
        <textarea
          id="additionalRequirements"
          name="additionalRequirements"
          value={formData.additionalRequirements}
          onChange={handleInputChange}
          rows={4}
          placeholder="Include any specific activities, differentiation, or assessment types you'd like in your lesson plan"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isGenerating || !formData.topic || !formData.gradeLevel}
          className={`flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary ${
            isGenerating || !formData.topic || !formData.gradeLevel
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-primary-dark'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Lesson Plan...
            </>
          ) : (
            'Generate Lesson Plan'
          )}
        </button>
      </div>
    </form>
  );
} 