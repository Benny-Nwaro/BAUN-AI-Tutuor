import { groqService } from '@/app/lib/groq';
import { LessonPlanData } from '@/app/components/lessonPlanner/LessonPlanGenerator';

type LessonPlanFormInput = {
  topic: string;
  gradeLevel: string;
  duration: string;
  standards: string;
  additionalRequirements: string;
};

// Grade level mapping for more descriptive grade levels in the output
const gradeLevelMap: Record<string, string> = {
  'pre-k': 'Pre-Kindergarten',
  'k': 'Kindergarten',
  '1': '1st Grade',
  '2': '2nd Grade',
  '3': '3rd Grade',
  '4': '4th Grade',
  '5': '5th Grade',
  '6': '6th Grade',
  '7': '7th Grade',
  '8': '8th Grade',
  '9': '9th Grade',
  '10': '10th Grade',
  '11': '11th Grade',
  '12': '12th Grade',
  'college': 'College/University Level',
};

// Duration mapping for more descriptive durations in the output
const durationMap: Record<string, string> = {
  '30': '30 minutes',
  '45': '45 minutes',
  '60': '60 minutes (1 hour)',
  '90': '90 minutes (1.5 hours)',
  '120': '2 hours',
  'multiple': 'Multiple class periods',
};

export async function generateLessonPlan(formInput: LessonPlanFormInput): Promise<LessonPlanData> {
  try {
    // Determine subject area based on topic keywords (this is a simple heuristic)
    const subject = determineSubject(formInput.topic);
    
    // Format the prompt for Groq
    const prompt = createLessonPlanPrompt(formInput, subject);
    
    // Get response from Groq API
    const responseText = await groqService.generateResponse(
      prompt,
      'teacher',
      [],
      null
    );
    
    // Parse the response into structured format
    const lessonPlan = parseResponseToLessonPlan(responseText, formInput, subject);
    
    // Validate if the lesson plan has sufficient content
    const isDetailedEnough = validateLessonPlanDetail(lessonPlan);
    
    if (!isDetailedEnough) {
      console.log("Initial lesson plan wasn't detailed enough, generating a better one...");
      
      // Try once more with an even more explicit prompt
      const enhancedPrompt = createLessonPlanPrompt(formInput, subject) + 
        "\n\nIMPORTANT: The previous lesson plan was too vague and lacked detail. Please provide EXTREMELY SPECIFIC and COMPREHENSIVE content for each section, including exact dialogue, questions, and step-by-step instructions.";
      
      const enhancedResponseText = await groqService.generateResponse(
        enhancedPrompt,
        'teacher',
        [],
        null
      );
      
      return parseResponseToLessonPlan(enhancedResponseText, formInput, subject);
    }
    
    return lessonPlan;
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw new Error('Failed to generate lesson plan. Please try again later.');
  }
}

// Simple heuristic to guess the subject area based on the topic
function determineSubject(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes('math') || 
      lowerTopic.includes('algebra') || 
      lowerTopic.includes('geometry') || 
      lowerTopic.includes('calculus') ||
      lowerTopic.includes('equation')) {
    return 'Mathematics';
  }
  
  if (lowerTopic.includes('science') || 
      lowerTopic.includes('biology') || 
      lowerTopic.includes('chemistry') || 
      lowerTopic.includes('physics') ||
      lowerTopic.includes('atom') ||
      lowerTopic.includes('cell') ||
      lowerTopic.includes('photosynthesis')) {
    return 'Science';
  }
  
  if (lowerTopic.includes('history') || 
      lowerTopic.includes('world war') || 
      lowerTopic.includes('civil war') || 
      lowerTopic.includes('civilization') ||
      lowerTopic.includes('revolution') ||
      lowerTopic.includes('ancient')) {
    return 'History';
  }
  
  if (lowerTopic.includes('english') || 
      lowerTopic.includes('literature') || 
      lowerTopic.includes('writing') || 
      lowerTopic.includes('grammar') ||
      lowerTopic.includes('essay') ||
      lowerTopic.includes('novel') ||
      lowerTopic.includes('poetry')) {
    return 'English Language Arts';
  }
  
  if (lowerTopic.includes('art') || 
      lowerTopic.includes('music') || 
      lowerTopic.includes('theater') || 
      lowerTopic.includes('visual') ||
      lowerTopic.includes('painting') ||
      lowerTopic.includes('drawing')) {
    return 'Fine Arts';
  }
  
  if (lowerTopic.includes('physical') || 
      lowerTopic.includes('health') || 
      lowerTopic.includes('fitness') || 
      lowerTopic.includes('sports')) {
    return 'Physical Education & Health';
  }
  
  if (lowerTopic.includes('computer') || 
      lowerTopic.includes('programming') || 
      lowerTopic.includes('coding') || 
      lowerTopic.includes('technology')) {
    return 'Computer Science & Technology';
  }
  
  // Default subject
  return 'General Education';
}

function createLessonPlanPrompt(formInput: LessonPlanFormInput, subject: string): string {
  const gradeLevelDisplay = formInput.gradeLevel ? gradeLevelMap[formInput.gradeLevel] || formInput.gradeLevel : 'unspecified grade level';
  const durationDisplay = formInput.duration ? durationMap[formInput.duration] || formInput.duration : '60 minutes';
  
  return `
You are an experienced curriculum developer and expert educator with years of classroom experience. Create a HIGHLY DETAILED and COMPREHENSIVE lesson plan for teaching "${formInput.topic}" to ${gradeLevelDisplay} students. The lesson is planned for ${durationDisplay}.

${formInput.standards ? `The lesson should align with the following standards: ${formInput.standards}` : ''}
${formInput.additionalRequirements ? `Additional requirements or notes: ${formInput.additionalRequirements}` : ''}

Please provide the lesson plan in the following structured format. For each section, include EXTENSIVE details, examples, scripts, and specific instructions. Be thorough and precise - this lesson plan should be detailed enough that any substitute teacher could implement it successfully.

1. Title: Create an engaging and creative title for this lesson that captures student interest.

2. Learning Objectives: List 3-5 clear, measurable learning objectives using SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound). Start each with strong action verbs (e.g., analyze, evaluate, synthesize, create, apply, etc.).

3. Standards Alignment: List specific standards this lesson addresses with their full text descriptions. ${formInput.standards ? 'Include and elaborate on the standards provided above.' : 'If no standards were provided, suggest 3-5 appropriate ones for this topic and grade level with their full text.'}

4. Materials and Resources: Provide a comprehensive list of ALL materials, technology, and resources needed, including:
   - Teacher materials and preparation requirements
   - Student materials (per student or group)
   - Technology resources with specific websites/apps
   - Handouts, worksheets, or templates (describe their contents)
   - Visual aids or manipulatives
   - Any additional resources to have on hand

5. Lesson Activities: Provide EXTREMELY DETAILED instructions for each part:
   a. Introduction/Warm-up (10-15 minutes): 
      - Describe a specific, engaging hook or attention-grabber
      - Include actual questions to ask students
      - Explain how to activate prior knowledge
      - Detail how to introduce the lesson objectives
      - Include time allocations for each component

   b. Main Activities (25-60 minutes): Describe 2-4 sequential, comprehensive learning activities that build understanding. For EACH activity include:
      - Specific step-by-step teacher instructions and what to say
      - Student grouping arrangements
      - Detailed procedures with timing for each step
      - Questions to pose during the activity
      - Anticipated student responses/misconceptions and how to address them
      - Transitions between activities
      - Formative assessment checkpoints

   c. Conclusion (10-15 minutes): 
      - Specific closure activities
      - Summary techniques
      - Exit ticket or final check for understanding
      - Connections to future learning

6. Assessment: Describe in detail:
   - Formative assessment strategies throughout the lesson
   - Summative assessment options (if applicable)
   - Success criteria for students
   - How data will be collected and used
   - Rubrics or scoring guides (if applicable)

7. Differentiation:
   a. For struggling students: Specific supports and modifications including:
      - Content modifications
      - Process adaptations
      - Product alternatives
      - Learning environment adjustments
      - Specific scaffolding techniques

   b. For advanced students: Detailed extension activities including:
      - Higher-order thinking tasks
      - Independent study options
      - Enrichment projects
      - Acceleration opportunities
      - Specific challenge questions

8. Homework/Extension: Describe optional assignments including:
   - Specific tasks and instructions
   - Purpose and learning goals
   - Materials needed
   - Expected time commitment
   - How it connects to class learning
   - How it will be reviewed/assessed

Please ensure the plan is grade-appropriate, engaging, and pedagogically sound. Use best teaching practices for ${subject} education. Your response should be extremely detailed in ALL sections - a bare-bones or summarized lesson plan is NOT acceptable. This should be classroom-ready with comprehensive details.
`;
}

function parseResponseToLessonPlan(responseText: string, formInput: LessonPlanFormInput, subject: string): LessonPlanData {
  try {
    // Default values in case parsing fails
    const defaultLessonPlan: LessonPlanData = {
      title: `Lesson Plan: ${formInput.topic}`,
      gradeLevel: formInput.gradeLevel ? gradeLevelMap[formInput.gradeLevel] || formInput.gradeLevel : 'Unspecified Grade',
      subject,
      duration: formInput.duration ? durationMap[formInput.duration] || formInput.duration : '60 minutes',
      objectives: ['Students will understand key concepts related to the topic.'],
      standards: formInput.standards ? [formInput.standards] : ['Standards not specified.'],
      materials: ['Basic classroom materials'],
      activities: {
        introduction: 'Begin with an engaging activity to introduce the topic.',
        mainActivities: ['Guide students through the main concepts and activities.'],
        conclusion: 'Review key points and check for understanding.'
      },
      assessment: 'Monitor student understanding through observation and questioning.',
      differentiation: {
        remediation: 'Provide additional support for struggling students.',
        enrichment: 'Offer challenges for advanced students.'
      },
      homework: 'Optional: Assign practice activities to reinforce learning.'
    };
    
    const contentValidation = (content: string, defaultValue: string, minLength: number = 50) => {
      if (!content || content.trim().length < minLength) {
        return defaultValue;
      }
      return content;
    };
    
    // Helper function to extract content with more robust patterns
    const extractSection = (sectionName: string): string => {
      // Try multiple pattern variations to improve extraction reliability
      const patterns = [
        new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n\\s*\\d+\\.\\s|$)`, 'i'),
        new RegExp(`${sectionName}([\\s\\S]*?)(?=\\n\\s*\\d+\\.\\s|$)`, 'i'),
        new RegExp(`\\d+\\.\\s*${sectionName}:([\\s\\S]*?)(?=\\n\\s*\\d+\\.\\s|$)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = responseText.match(pattern);
        if (match && match[1] && match[1].trim().length > 0) {
          return match[1].trim();
        }
      }
      
      return '';
    };
    
    // Extract title with improved pattern matching
    let title = defaultLessonPlan.title;
    const titleSection = extractSection('Title');
    if (titleSection) {
      title = titleSection;
    }
    
    // Extract objectives with improved pattern matching
    let objectives = defaultLessonPlan.objectives;
    const objectivesSection = extractSection('Learning Objectives');
    if (objectivesSection) {
      // Split by bullet points, numbers, or new lines
      objectives = objectivesSection
        .split(/\n|•|\*|-|(?:\d+\.)/)
        .map(item => item.trim())
        .filter(item => item.length > 10); // Filter out short lines that are likely not objectives
      
      if (objectives.length === 0) {
        // Try alternative parsing
        objectives = objectivesSection
          .split(/\n\s*/)
          .map(item => item.replace(/^[-*•]?\s*/, '').trim())
          .filter(item => item.length > 10);
      }
    }
    
    // Extract standards with improved pattern matching
    let standards = defaultLessonPlan.standards;
    const standardsSection = extractSection('Standards Alignment');
    if (standardsSection) {
      standards = standardsSection
        .split(/\n|•|\*|-|(?:\d+\.)/)
        .map(item => item.trim())
        .filter(item => item.length > 5);
      
      if (standards.length === 0) {
        // Try alternative parsing
        standards = standardsSection
          .split(/\n\s*/)
          .map(item => item.replace(/^[-*•]?\s*/, '').trim())
          .filter(item => item.length > 5);
      }
    }
    
    // Extract materials with improved pattern matching
    let materials = defaultLessonPlan.materials;
    const materialsSection = extractSection('Materials and Resources');
    if (materialsSection) {
      materials = materialsSection
        .split(/\n|•|\*|-|(?:\d+\.)/)
        .map(item => item.trim())
        .filter(item => item.length > 3);
      
      if (materials.length === 0) {
        // Try alternative parsing
        materials = materialsSection
          .split(/\n\s*/)
          .map(item => item.replace(/^[-*•]?\s*/, '').trim())
          .filter(item => item.length > 3);
      }
    }
    
    // Extract activities with improved pattern matching
    let introduction = defaultLessonPlan.activities.introduction;
    let mainActivities = defaultLessonPlan.activities.mainActivities;
    let conclusion = defaultLessonPlan.activities.conclusion;
    
    const activitiesSection = extractSection('Lesson Activities');
    if (activitiesSection) {
      // Try to extract introduction
      const introPattern = /(?:a\.|Introduction|Warm-up)(?:\s*\([^)]*\))?:([^]*?)(?=(?:b\.|Main Activities)|$)/i;
      const introMatch = activitiesSection.match(introPattern);
      if (introMatch && introMatch[1]) {
        introduction = contentValidation(introMatch[1].trim(), introduction);
      }
      
      // Try to extract main activities
      const mainPattern = /(?:b\.|Main Activities)(?:\s*\([^)]*\))?:([^]*?)(?=(?:c\.|Conclusion)|$)/i;
      const mainMatch = activitiesSection.match(mainPattern);
      if (mainMatch && mainMatch[1]) {
        const mainContent = mainMatch[1].trim();
        
        // Try to split by numbered items, bullet points, or paragraphs
        const activityPatterns = [
          /(?:\d+\.\s*)([^]*?)(?=\d+\.\s*|$)/g,  // Numbered items
          /(?:[-•*]\s*)([^]*?)(?=[-•*]\s*|$)/g,  // Bullet points
          /(?:\n\n)([^]*?)(?=\n\n|$)/g           // Double line breaks
        ];
        
        let extractedActivities: string[] = [];
        
        // Try each pattern until we get meaningful results
        for (const pattern of activityPatterns) {
          const matches = Array.from(mainContent.matchAll(pattern));
          if (matches.length > 0) {
            extractedActivities = matches
              .map(m => m[1].trim())
              .filter(item => item.length > 20);
            
            if (extractedActivities.length > 0) {
              break;
            }
          }
        }
        
        // If patterns failed, split by paragraphs
        if (extractedActivities.length === 0) {
          extractedActivities = mainContent
            .split(/\n\s*\n/)
            .map(item => item.trim())
            .filter(item => item.length > 20);
        }
        
        // If we still have nothing, use the whole section
        if (extractedActivities.length === 0 && mainContent.length > 50) {
          extractedActivities = [mainContent];
        }
        
        // Only update if we found something meaningful
        if (extractedActivities.length > 0) {
          mainActivities = extractedActivities;
        }
      }
      
      // Try to extract conclusion
      const conclusionPattern = /(?:c\.|Conclusion)(?:\s*\([^)]*\))?:([^]*?)(?=\d+\.\s*|$)/i;
      const conclusionMatch = activitiesSection.match(conclusionPattern);
      if (conclusionMatch && conclusionMatch[1]) {
        conclusion = contentValidation(conclusionMatch[1].trim(), conclusion);
      }
    }
    
    // Extract assessment with improved pattern matching
    let assessment = defaultLessonPlan.assessment;
    const assessmentSection = extractSection('Assessment');
    if (assessmentSection) {
      assessment = contentValidation(assessmentSection, assessment);
    }
    
    // Extract differentiation with improved pattern matching
    let remediation = defaultLessonPlan.differentiation.remediation;
    let enrichment = defaultLessonPlan.differentiation.enrichment;
    
    const differentiationSection = extractSection('Differentiation');
    if (differentiationSection) {
      // Extract remediation
      const remediationPattern = /(?:a\.|For struggling students):([^]*?)(?=(?:b\.|For advanced students)|$)/i;
      const remediationMatch = differentiationSection.match(remediationPattern);
      if (remediationMatch && remediationMatch[1]) {
        remediation = contentValidation(remediationMatch[1].trim(), remediation);
      }
      
      // Extract enrichment
      const enrichmentPattern = /(?:b\.|For advanced students):([^]*?)(?=\n\d+\.\s*|$)/i;
      const enrichmentMatch = differentiationSection.match(enrichmentPattern);
      if (enrichmentMatch && enrichmentMatch[1]) {
        enrichment = contentValidation(enrichmentMatch[1].trim(), enrichment);
      }
    }
    
    // Extract homework with improved pattern matching
    let homework = defaultLessonPlan.homework;
    const homeworkSection = extractSection('Homework/Extension');
    if (homeworkSection) {
      homework = contentValidation(homeworkSection, homework);
    }
    
    // Validate that all sections have meaningful content
    // If any critical section is missing or too short, try to extract it differently
    if (mainActivities.length === 1 && mainActivities[0].length < 100) {
      // Try an alternative approach for main activities
      const mainSectionRaw = responseText.slice(
        responseText.indexOf('Main Activities'),
        responseText.indexOf('Conclusion') !== -1 ? responseText.indexOf('Conclusion') : undefined
      );
      
      if (mainSectionRaw && mainSectionRaw.length > 100) {
        mainActivities = mainSectionRaw
          .split(/\n/)
          .filter(line => line.trim().length > 20 && !line.includes('Main Activities'))
          .map(item => item.replace(/^[-*•]?\s*/, '').trim());
      }
    }
    
    // Construct the lesson plan with validated content
    return {
      title,
      gradeLevel: formInput.gradeLevel ? gradeLevelMap[formInput.gradeLevel] || formInput.gradeLevel : 'Unspecified Grade',
      subject,
      duration: formInput.duration ? durationMap[formInput.duration] || formInput.duration : '60 minutes',
      objectives: objectives.length > 0 ? objectives : defaultLessonPlan.objectives,
      standards: standards.length > 0 ? standards : defaultLessonPlan.standards,
      materials: materials.length > 0 ? materials : defaultLessonPlan.materials,
      activities: {
        introduction,
        mainActivities: mainActivities.length > 0 ? mainActivities : defaultLessonPlan.activities.mainActivities,
        conclusion
      },
      assessment,
      differentiation: {
        remediation,
        enrichment
      },
      homework
    };
  } catch (error) {
    console.error('Error parsing lesson plan response:', error);
    
    // Return basic lesson plan if parsing fails
    return {
      title: `Lesson Plan: ${formInput.topic}`,
      gradeLevel: formInput.gradeLevel ? gradeLevelMap[formInput.gradeLevel] || formInput.gradeLevel : 'Unspecified Grade',
      subject: subject,
      duration: formInput.duration ? durationMap[formInput.duration] || formInput.duration : '60 minutes',
      objectives: ['Students will understand key concepts related to the topic.'],
      standards: formInput.standards ? [formInput.standards] : ['Standards not specified.'],
      materials: ['Basic classroom materials'],
      activities: {
        introduction: 'Begin with an engaging activity to introduce the topic.',
        mainActivities: ['Guide students through the main concepts and activities.'],
        conclusion: 'Review key points and check for understanding.'
      },
      assessment: 'Monitor student understanding through observation and questioning.',
      differentiation: {
        remediation: 'Provide additional support for struggling students.',
        enrichment: 'Offer challenges for advanced students.'
      },
      homework: 'Optional: Assign practice activities to reinforce learning.'
    };
  }
}

// Function to validate that the lesson plan has sufficient detail
function validateLessonPlanDetail(lessonPlan: LessonPlanData): boolean {
  // Check if main activities have sufficient detail
  const mainActivitiesDetailLevel = lessonPlan.activities.mainActivities.reduce(
    (total, activity) => total + activity.length, 
    0
  );
  
  // Check if critical sections have sufficient length
  const hasDetailedIntroduction = lessonPlan.activities.introduction.length > 100;
  const hasDetailedMainActivities = mainActivitiesDetailLevel > 250;
  const hasDetailedConclusion = lessonPlan.activities.conclusion.length > 80;
  const hasDetailedAssessment = lessonPlan.assessment.length > 100;
  
  // Need most of these to be true for a detailed lesson plan
  return (hasDetailedIntroduction && hasDetailedMainActivities && 
          (hasDetailedConclusion || hasDetailedAssessment));
} 