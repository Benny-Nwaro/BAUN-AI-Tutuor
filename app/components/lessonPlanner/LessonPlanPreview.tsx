'use client';

import React from 'react';
import {
  ClockIcon,
  BeakerIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PencilIcon,
  ArrowPathIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { LessonPlanData } from './LessonPlanGenerator';

interface LessonPlanPreviewProps {
  lessonPlan: LessonPlanData;
}

export default function LessonPlanPreview({ lessonPlan }: LessonPlanPreviewProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {lessonPlan.subject} | {lessonPlan.gradeLevel}
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {lessonPlan.title}
            </h2>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{lessonPlan.duration}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
        {/* Objectives and Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
              Learning Objectives
            </h3>
            <ul className="list-disc list-outside ml-4 space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300">
              {lessonPlan.objectives.map((objective, index) => (
                <li key={index} className="text-xs sm:text-sm">
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
              Standards Alignment
            </h3>
            <ul className="list-disc list-outside ml-4 space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300">
              {lessonPlan.standards.map((standard, index) => (
                <li key={index} className="text-xs sm:text-sm">
                  {standard}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Materials */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
            <BeakerIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            Materials and Resources
          </h3>
          <ul className="list-disc list-outside ml-4 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-gray-600 dark:text-gray-300">
            {lessonPlan.materials.map((material, index) => (
              <li key={index} className="text-xs sm:text-sm">
                {material}
              </li>
            ))}
          </ul>
        </div>

        {/* Activities */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
            <PencilIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            Lesson Activities
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2">Introduction / Warm-up</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{lessonPlan.activities.introduction}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2">Main Activities</h4>
              <div className="space-y-2 sm:space-y-3">
                {lessonPlan.activities.mainActivities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-primary">{index + 1}.</span> {activity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2">Conclusion / Wrap-up</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{lessonPlan.activities.conclusion}</p>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
            <ScaleIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            Assessment
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{lessonPlan.assessment}</p>
          </div>
        </div>

        {/* Differentiation */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
            <ArrowPathIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
            Differentiation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2">For Struggling Students</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{lessonPlan.differentiation.remediation}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 sm:mb-2">For Advanced Students</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{lessonPlan.differentiation.enrichment}</p>
            </div>
          </div>
        </div>

        {/* Homework */}
        {lessonPlan.homework && (
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center mb-2 sm:mb-3">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
              Homework / Extension
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{lessonPlan.homework}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 