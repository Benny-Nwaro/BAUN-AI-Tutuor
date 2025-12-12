import { QuizQuestion } from "../components/quiz/QuickQuiz";
import { groqService } from "./groq";

// Generates quiz questions based on content using AI
export async function generateQuizQuestions(
  content: string,
  topic: string,
  numberOfQuestions: number = 3
): Promise<QuizQuestion[]> {
  try {
    // Use AI to generate quiz questions based on the content
    const promptTemplate = `
You are an educational assistant creating a quiz to test understanding of a learning topic.
Based on the following educational content, generate ${numberOfQuestions} multiple-choice quiz questions about ${topic}.

For each question:
1. Create a clear, concise question that tests understanding of key concepts
2. Provide exactly 4 answer options that are distinct and plausible
3. Indicate which option is correct (0-indexed)
4. Include a brief explanation of why the answer is correct

Content: ${content.substring(0, 2500)}

Format your response as a valid JSON array with the following structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Explanation of why Option A is correct"
  }
]
`;

    // Call the AI API to generate questions
    const jsonResponseStr = await groqService.generateResponse(
      promptTemplate,
      'teacher',
      [],
      null
    );

    try {
      // Parse the response and extract the questions
      // Find JSON array in the response (may be surrounded by other text)
      const jsonMatch = jsonResponseStr.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const parsedQuestions = JSON.parse(jsonString) as QuizQuestion[];
        
        // Validate questions
        const validQuestions = parsedQuestions.filter(q => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length === 4 && 
          typeof q.correctAnswerIndex === 'number' &&
          q.correctAnswerIndex >= 0 && 
          q.correctAnswerIndex <= 3 &&
          q.explanation
        );
        
        if (validQuestions.length > 0) {
          return validQuestions.slice(0, numberOfQuestions);
        }
      }
      
      console.error('Failed to parse quiz questions from AI response:', jsonResponseStr);
      return getDummyQuestions(topic, numberOfQuestions);
    } catch (parseError) {
      console.error('Error parsing AI-generated quiz questions:', parseError);
      return getDummyQuestions(topic, numberOfQuestions);
    }
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return getDummyQuestions(topic, numberOfQuestions);
  }
}

// Extract topics from conversation content with better detection
export function extractTopicsFromContent(content: string): string[] {
  // First, try to find the main topic from the conversation
  const mainTopicMatch = content.match(/about\s+([^.,!?]+)|topic\s+of\s+([^.,!?]+)|discussing\s+([^.,!?]+)/i);
  if (mainTopicMatch) {
    const mainTopic = mainTopicMatch[1] || mainTopicMatch[2] || mainTopicMatch[3];
    if (mainTopic) {
      return [mainTopic.trim()];
    }
  }

  // If no explicit topic is found, look for key concepts
  const keyConcepts = content.match(/(?:key\s+concept|main\s+idea|focus\s+on)\s+([^.,!?]+)/gi);
  if (keyConcepts) {
    return keyConcepts.map(concept => concept.replace(/(?:key\s+concept|main\s+idea|focus\s+on)\s+/i, '').trim());
  }

  // Fallback to predefined topics only if no specific topic is found
  const commonTopics = [
    // Mathematics
    "mathematics", "algebra", "calculus", "statistics", "geometry", "trigonometry", "arithmetic",
    "linear algebra", "differential equations", "probability", "number theory", "mathematical analysis",
    
    // Sciences
    "physics", "chemistry", "biology", "astronomy", "geology", "environmental science",
    "organic chemistry", "inorganic chemistry", "quantum mechanics", "thermodynamics",
    "molecular biology", "cellular biology", "genetics", "evolution", "ecology",
    
    // Computer Science and Programming
    "computer science", "programming", "algorithms", "data structures", "artificial intelligence",
    "machine learning", "deep learning", "neural networks", "databases", "web development",
    "software engineering", "operating systems", "computer networks", "cybersecurity",
    "python", "javascript", "java", "c++", "html", "css", "sql", "react", "node.js",
    
    // Humanities
    "history", "geography", "literature", "philosophy", "psychology", "sociology",
    "political science", "economics", "anthropology", "linguistics", "religious studies",
    "world history", "european history", "american history", "asian history",
    
    // Languages and Writing
    "grammar", "writing", "composition", "rhetoric", "language arts", "english language",
    "spanish", "french", "german", "chinese", "japanese", "latin", "creative writing",
    
    // Arts
    "art", "music", "theater", "film studies", "photography", "design", "architecture",
    "visual arts", "performing arts", "art history", "music theory", "digital media"
  ];
  
  // Count occurrences of each topic in the content
  const topicCounts: Record<string, number> = {};
  const lowerContent = content.toLowerCase();
  
  commonTopics.forEach(topic => {
    const regex = new RegExp(`\\b${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerContent.match(regex);
    if (matches) {
      topicCounts[topic] = matches.length;
    }
  });
  
  // Sort topics by occurrence count
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  return sortedTopics.length ? sortedTopics : ["Recent Learning"];
}

// Function to determine if content is quiz-worthy
export function isContentQuizWorthy(content: string): boolean {
  // Minimum length check - needs to be substantial
  if (content.length < 250) return false;
  
  // Check if it has educational content indicators
  const educationalPhrases = [
    // Learning indicators
    "concept", "understand", "learn", "explain", "definition",
    "example", "theory", "principle", "important", "key point",
    "remember", "note that", "consider", "for instance",
    
    // Structural indicators
    "in summary", "summary", "therefore", "thus", "consequently", 
    "as a result", "in conclusion", "to conclude", "finally",
    
    // Educational connectors
    "first", "second", "third", "next", "then", "additionally",
    "furthermore", "moreover", "in addition", "similarly",
    
    // Teaching phrases
    "is defined as", "can be described as", "refers to", "is a type of",
    "is characterized by", "consists of", "is composed of", "works by",
    
    // Step-by-step indicators
    "step", "process", "procedure", "method", "technique", "approach",
    "strategy", "framework", "model", "system", "mechanism"
  ];
  
  const lowerContent = content.toLowerCase();
  
  // Check for educational phrases
  let phraseCount = 0;
  for (const phrase of educationalPhrases) {
    if (lowerContent.includes(phrase)) {
      phraseCount++;
      if (phraseCount >= 2) return true;
    }
  }
  
  // Check for structural indicators of educational content
  const hasNumberedList = /\d+\.\s+.+(\n|\r\n)\s*\d+\.\s+.+/g.test(content);
  const hasBulletPoints = /•\s+.+(\n|\r\n)\s*•\s+.+/g.test(content) || 
                         /\*\s+.+(\n|\r\n)\s*\*\s+.+/g.test(content) ||
                         /-\s+.+(\n|\r\n)\s*-\s+.+/g.test(content);
  
  // Check for code blocks or technical content
  const hasCodeBlocks = /```[\s\S]+?```/g.test(content) || /`[^`]+`/g.test(content);
  
  // Check for question-answer patterns
  const hasQA = /\?[\s\n]+[A-Z]/g.test(content);
  
  return hasNumberedList || hasBulletPoints || hasCodeBlocks || hasQA || phraseCount >= 1;
}

// Generate dummy questions for testing/placeholder or fallback
function getDummyQuestions(topic: string, count: number): QuizQuestion[] {
  const questions: Record<string, QuizQuestion[]> = {
    "mathematics": [
      {
        question: "What is the value of π (pi) to two decimal places?",
        options: ["3.14", "3.16", "3.12", "3.18"],
        correctAnswerIndex: 0,
        explanation: "The value of π is approximately 3.14159, which rounds to 3.14 when expressed with two decimal places."
      },
      {
        question: "What is the formula for the area of a circle?",
        options: ["πr²", "2πr", "πr³", "2πr²"],
        correctAnswerIndex: 0,
        explanation: "The area of a circle is calculated using the formula πr², where r is the radius of the circle."
      },
      {
        question: "What is the result of 7 × 8?",
        options: ["54", "56", "48", "64"],
        correctAnswerIndex: 1,
        explanation: "7 × 8 = 56. This is a basic multiplication fact."
      }
    ],
    "programming": [
      {
        question: "What does the term 'API' stand for in programming?",
        options: ["Application Programming Interface", "Automated Programming Integration", "Application Process Integration", "Automated Program Interface"],
        correctAnswerIndex: 0,
        explanation: "API stands for Application Programming Interface, which allows different software applications to communicate with each other."
      },
      {
        question: "In JavaScript, which keyword is used to declare a variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        correctAnswerIndex: 2,
        explanation: "The 'const' keyword is used to declare variables that cannot be reassigned after initialization in JavaScript."
      },
      {
        question: "What does CSS stand for in web development?",
        options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Sheets"],
        correctAnswerIndex: 2,
        explanation: "CSS stands for Cascading Style Sheets, which is used to control the presentation and layout of web pages."
      }
    ],
    "chemistry": [
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gl", "Au", "Ag"],
        correctAnswerIndex: 2,
        explanation: "The chemical symbol for gold is Au, which comes from the Latin word 'aurum'."
      },
      {
        question: "What is the most abundant gas in Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctAnswerIndex: 2,
        explanation: "Nitrogen makes up about 78% of Earth's atmosphere, making it the most abundant gas."
      },
      {
        question: "What is the pH of pure water at room temperature?",
        options: ["0", "7", "14", "1"],
        correctAnswerIndex: 1,
        explanation: "Pure water has a pH of 7, which is considered neutral (neither acidic nor basic)."
      }
    ],
    "physics": [
      {
        question: "What is Newton's Second Law of Motion?",
        options: [
          "An object at rest stays at rest unless acted upon by a force",
          "Force equals mass times acceleration",
          "For every action, there is an equal and opposite reaction",
          "Energy cannot be created or destroyed"
        ],
        correctAnswerIndex: 1,
        explanation: "Newton's Second Law states that force (F) equals mass (m) times acceleration (a), or F = ma."
      },
      {
        question: "What is the SI unit of electric current?",
        options: ["Volt", "Watt", "Ampere", "Ohm"],
        correctAnswerIndex: 2,
        explanation: "The ampere (A) is the SI unit of electric current."
      },
      {
        question: "What type of wave is sound?",
        options: ["Transverse wave", "Longitudinal wave", "Electromagnetic wave", "Gravity wave"],
        correctAnswerIndex: 1,
        explanation: "Sound is a longitudinal wave, meaning the particles of the medium vibrate parallel to the direction of wave propagation."
      }
    ],
    "computer science": [
      {
        question: "What does CPU stand for?",
        options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Central Processor Utility"],
        correctAnswerIndex: 0,
        explanation: "CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing."
      },
      {
        question: "Which of these is not a programming language?",
        options: ["Java", "Python", "HTML", "Microsoft"],
        correctAnswerIndex: 3,
        explanation: "Microsoft is a company, not a programming language. Java, Python, and HTML are all programming or markup languages."
      },
      {
        question: "What does 'HTTP' stand for?",
        options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "Home Tool Transfer Protocol", "HyperText Technology Program"],
        correctAnswerIndex: 0,
        explanation: "HTTP stands for HyperText Transfer Protocol, which is the foundation of data communication on the World Wide Web."
      }
    ],
    "general knowledge": [
      {
        question: "What is the main purpose of a variable in programming?",
        options: ["To store data", "To create functions", "To format text", "To connect to the internet"],
        correctAnswerIndex: 0,
        explanation: "Variables are used to store data values that can be used and manipulated throughout a program."
      },
      {
        question: "Which of these is an example of a renewable energy source?",
        options: ["Coal", "Natural gas", "Solar power", "Petroleum"],
        correctAnswerIndex: 2,
        explanation: "Solar power is a renewable energy source as it comes from the sun, which is naturally replenished. Coal, natural gas, and petroleum are non-renewable fossil fuels."
      },
      {
        question: "What is the process by which plants make their own food called?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
        correctAnswerIndex: 1,
        explanation: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water."
      }
    ]
  };

  // Match the topic against our categories - check for substring matches
  const lowercaseTopic = topic.toLowerCase();
  
  // First try direct match
  if (questions[lowercaseTopic]) {
    return questions[lowercaseTopic].slice(0, count);
  }
  
  // Then try substring match
  for (const [key, value] of Object.entries(questions)) {
    if (lowercaseTopic.includes(key) || key.includes(lowercaseTopic)) {
      return value.slice(0, count);
    }
  }
  
  // Fall back to general knowledge if topic not found
  return questions["general knowledge"].slice(0, count);
} 