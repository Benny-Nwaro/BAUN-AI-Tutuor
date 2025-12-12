'use client';

import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import LessonPlanForm from './LessonPlanForm';
import LessonPlanPreview from './LessonPlanPreview';
import { generateLessonPlan } from '@/app/lib/lessonPlanGenerator';
import { PDFExportButton } from './PDFExportButton';

export type LessonPlanData = {
  title: string;
  gradeLevel: string;
  subject: string;
  duration: string;
  objectives: string[];
  standards: string[];
  materials: string[];
  activities: {
    introduction: string;
    mainActivities: string[];
    conclusion: string;
  };
  assessment: string;
  differentiation: {
    remediation: string;
    enrichment: string;
  };
  homework: string;
};

export default function LessonPlanGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    gradeLevel: '',
    duration: '60',
    standards: '',
    additionalRequirements: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const generatedPlan = await generateLessonPlan(formData);
      setLessonPlan(generatedPlan);
    } catch (error) {
      console.error('Error generating lesson plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
          <AcademicCapIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary flex-shrink-0" />
          <span className="truncate">Lesson Plan Generator</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Create comprehensive, standards-aligned lesson plans in minutes
        </p>
      </div>

      {!lessonPlan ? (
        <LessonPlanForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isGenerating}
        />
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
              <span className="truncate">{lessonPlan.title}</span>
            </h3>
            <div className="flex gap-2">
              <PDFExportButton lessonPlan={lessonPlan} />
              <button
                onClick={() => setLessonPlan(null)}
                className="flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                <span className="whitespace-nowrap">Create New</span>
              </button>
            </div>
          </div>
          
          <LessonPlanPreview lessonPlan={lessonPlan} />
        </div>
      )}
    </div>
  );
} 