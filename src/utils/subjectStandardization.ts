/**
 * Subject standardization utilities to normalize subject names across different data sources
 */

// Mapping from quiz titles and other sources to standardized subject names
const SUBJECT_STANDARDIZATION_MAP: Record<string, string> = {
  // AI/Computer Science related
  'quiz on introduction generative ai': 'Computer Science',
  'introduction to ai': 'Computer Science',
  'artificial intelligence': 'Computer Science',
  'machine learning': 'Computer Science',
  'data science': 'Computer Science',
  'programming': 'Computer Science',
  'python': 'Computer Science',
  'javascript': 'Computer Science',
  'web development': 'Computer Science',
  
  // Mathematics variations
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'algebra': 'Mathematics',
  'calculus': 'Mathematics',
  'geometry': 'Mathematics',
  'statistics': 'Mathematics',
  
  // Science variations
  'physics': 'Physics',
  'chemistry': 'Chemistry',
  'biology': 'Biology',
  'science': 'General Science',
  
  // Languages
  'english literature': 'English',
  'english language': 'English',
  'french language': 'French',
  'spanish language': 'Spanish',
  'german language': 'German',
  
  // Social studies
  'history': 'History',
  'geography': 'Geography',
  'social studies': 'Social Studies',
  
  // Arts
  'art': 'Art',
  'music': 'Music',
  'literature': 'Literature',
};

/**
 * Extract subject from quiz title or other source
 */
const extractSubjectFromQuizTitle = (title: string): string => {
  const normalized = title.toLowerCase().trim();
  
  // Remove common quiz prefixes
  const cleanTitle = normalized
    .replace(/^(quiz on|test on|exam on|assessment on)\s+/i, '')
    .replace(/\s+(quiz|test|exam|assessment)$/i, '')
    .trim();
  
  // Look for subject keywords in the cleaned title
  for (const [keyword, subject] of Object.entries(SUBJECT_STANDARDIZATION_MAP)) {
    if (cleanTitle.includes(keyword) || keyword.includes(cleanTitle)) {
      return subject;
    }
  }
  
  // If no match found, capitalize the cleaned title as a custom subject
  return cleanTitle.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Standardize subject name from any source
 */
export const standardizeSubjectName = (
  source: string | null | undefined,
  sourceType: 'flashcard' | 'quiz' | 'session' | 'plan' | 'note' = 'session'
): string => {
  if (!source || source.trim() === '') {
    return 'General';
  }
  
  const normalized = source.toLowerCase().trim();
  
  // Direct mapping first
  if (SUBJECT_STANDARDIZATION_MAP[normalized]) {
    return SUBJECT_STANDARDIZATION_MAP[normalized];
  }
  
  // Special handling for quiz titles
  if (sourceType === 'quiz') {
    return extractSubjectFromQuizTitle(source);
  }
  
  // Partial match for other sources
  for (const [keyword, subject] of Object.entries(SUBJECT_STANDARDIZATION_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return subject;
    }
  }
  
  // Return capitalized version if no match
  return source.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Check if a subject has meaningful learning activity
 */
export const hasValidLearningActivity = (subject: {
  completionPercentage: number;
  totalStudyTimeMinutes: number;
  sessionCount: number;
}): boolean => {
  // Subject is valid if it has either:
  // 1. Study time/sessions (actual learning activity)
  // 2. Meaningful progress with some indication of study
  return (
    subject.totalStudyTimeMinutes > 0 || 
    subject.sessionCount > 0 || 
    (subject.completionPercentage > 0 && subject.completionPercentage < 100)
  );
};

/**
 * Get display message for subjects without sessions
 */
export const getStudyStatusMessage = (subject: {
  completionPercentage: number;
  totalStudyTimeMinutes: number;
  sessionCount: number;
}): { hasActivity: boolean; message?: string } => {
  if (subject.totalStudyTimeMinutes > 0 || subject.sessionCount > 0) {
    return { hasActivity: true };
  }
  
  if (subject.completionPercentage > 0) {
    return { 
      hasActivity: false, 
      message: 'Progress from quizzes/flashcards - start study sessions to track time' 
    };
  }
  
  return { 
    hasActivity: false, 
    message: 'No study activity yet' 
  };
};