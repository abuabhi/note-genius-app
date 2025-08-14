import { Note } from '@/types/note';
import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { Quiz, QuizQuestion, QuizOption } from '@/types/quiz';
import { StudyGoal } from '@/types/study';

// Note factory
export const createMockNote = (overrides: Partial<Note> = {}): Note => {
  return {
    id: 'note-' + Math.random().toString(36).substr(2, 9),
    title: 'Test Note',
    description: 'Test Description',
    content: 'Test Content',
    date: new Date().toISOString().split('T')[0],
    subject: 'Math',
    sourceType: 'manual',
    archived: false,
    pinned: false,
    tags: [],
    ...overrides
  };
};

export const createMockNotes = (count: number = 3): Note[] => {
  return Array.from({ length: count }, (_, i) => createMockNote({
    id: `note-${i + 1}`,
    title: `Test Note ${i + 1}`,
    subject: i % 2 === 0 ? 'Math' : 'Science'
  }));
};

// Flashcard factory
export const createMockFlashcard = (overrides: Partial<Flashcard> = {}): Flashcard => {
  return {
    id: 'card-' + Math.random().toString(36).substr(2, 9),
    front: 'Front content',
    back: 'Back content',
    front_content: 'Front content',
    back_content: 'Back content',
    set_id: 'set-1',
    difficulty: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
};

export const createMockFlashcardSet = (overrides: Partial<FlashcardSet> = {}): FlashcardSet => {
  return {
    id: 'set-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Flashcard Set',
    description: 'Test Description',
    subject: 'Math',
    user_id: 'user-1',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    card_count: 10,
    ...overrides
  };
};

// Quiz factory
export const createMockQuizOption = (overrides: Partial<QuizOption> = {}): QuizOption => {
  return {
    id: 'option-' + Math.random().toString(36).substr(2, 9),
    question_id: 'question-1',
    content: 'Option text',
    is_correct: false,
    position: 0,
    ...overrides
  };
};

export const createMockQuizQuestion = (overrides: Partial<QuizQuestion> = {}): QuizQuestion => {
  return {
    id: 'question-' + Math.random().toString(36).substr(2, 9),
    quiz_id: 'quiz-1',
    question: 'What is 2 + 2?',
    question_type: 'multiple_choice',
    explanation: null,
    difficulty: 1,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
};

export const createMockQuiz = (overrides: Partial<Quiz> = {}): Quiz => {
  return {
    id: 'quiz-' + Math.random().toString(36).substr(2, 9),
    title: 'Test Quiz',
    description: 'Test Quiz Description',
    subject_id: null,
    user_subject_id: null,
    section_id: null,
    grade_id: null,
    source_type: 'custom',
    source_id: null,
    user_id: 'user-1',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questionCount: 5,
    ...overrides
  };
};

// Study Goal factory
export const createMockStudyGoal = (overrides: Partial<StudyGoal> = {}): StudyGoal => {
  return {
    id: 'goal-' + Math.random().toString(36).substr(2, 9),
    title: 'Test Study Goal',
    description: 'Test goal description',
    target_value: 100,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    user_id: 'user-1',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
};

// User mock
export const createMockUser = (overrides: any = {}) => {
  return {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User'
    },
    ...overrides
  };
};

// Test utilities
export const createTestData = {
  notes: createMockNotes,
  note: createMockNote,
  flashcardSet: createMockFlashcardSet,
  flashcard: createMockFlashcard,
  quiz: createMockQuiz,
  quizQuestion: createMockQuizQuestion,
  quizOption: createMockQuizOption,
  studyGoal: createMockStudyGoal,
  user: createMockUser
};