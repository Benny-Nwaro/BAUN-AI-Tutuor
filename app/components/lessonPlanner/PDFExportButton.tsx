'use client';

import React, { useRef } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { LessonPlanData } from './LessonPlanGenerator';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportButtonProps {
  lessonPlan: LessonPlanData;
}

export function PDFExportButton({ lessonPlan }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary container to render the PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '800px';
      pdfContent.style.padding = '40px';
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.innerHTML = generateHTMLContent(lessonPlan);
      
      document.body.appendChild(pdfContent);
      
      // Convert to PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Split into pages if content is too long
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`${lessonPlan.title.replace(/\s+/g, '_')}_lesson_plan.pdf`);
      
      // Clean up
      document.body.removeChild(pdfContent);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to generate HTML content for the PDF
  const generateHTMLContent = (plan: LessonPlanData): string => {
    return `
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        h1 { font-size: 24px; margin-bottom: 10px; color: #222; }
        h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; color: #444; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        h3 { font-size: 16px; margin-top: 15px; margin-bottom: 5px; color: #555; }
        ul { padding-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 5px; }
        .header { margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .activity { background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        .metadata { color: #777; font-size: 14px; margin-bottom: 5px; }
        .differentiation { display: flex; gap: 20px; }
        .diff-section { flex: 1; background-color: #f9f9f9; padding: 10px; border-radius: 4px; }
      </style>
      <div class="header">
        <h1>${plan.title}</h1>
        <p class="metadata">${plan.subject} | ${plan.gradeLevel} | Duration: ${plan.duration}</p>
      </div>
      
      <div class="section">
        <h2>Learning Objectives</h2>
        <ul>
          ${plan.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h2>Standards Alignment</h2>
        <ul>
          ${plan.standards.map(std => `<li>${std}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h2>Materials and Resources</h2>
        <ul>
          ${plan.materials.map(mat => `<li>${mat}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h2>Lesson Activities</h2>
        
        <h3>Introduction / Warm-up</h3>
        <div class="activity">
          ${plan.activities.introduction}
        </div>
        
        <h3>Main Activities</h3>
        ${plan.activities.mainActivities.map((act, idx) => 
          `<div class="activity">
            <strong>${idx + 1}.</strong> ${act}
          </div>`
        ).join('')}
        
        <h3>Conclusion / Wrap-up</h3>
        <div class="activity">
          ${plan.activities.conclusion}
        </div>
      </div>
      
      <div class="section">
        <h2>Assessment</h2>
        <div class="activity">
          ${plan.assessment}
        </div>
      </div>
      
      <div class="section">
        <h2>Differentiation</h2>
        <div class="differentiation">
          <div class="diff-section">
            <h3>For Struggling Students</h3>
            ${plan.differentiation.remediation}
          </div>
          <div class="diff-section">
            <h3>For Advanced Students</h3>
            ${plan.differentiation.enrichment}
          </div>
        </div>
      </div>
      
      ${plan.homework ? `
        <div class="section">
          <h2>Homework / Extension</h2>
          <div class="activity">
            ${plan.homework}
          </div>
        </div>
      ` : ''}
    `;
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`flex items-center px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors ${
        isGenerating ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        <>
          <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
          Download PDF
        </>
      )}
    </button>
  );
} 