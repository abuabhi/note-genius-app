
import { Guide, GuideContext } from '@/types/guide';

export const guideContent: Guide[] = [
  {
    id: 'dashboard-welcome',
    title: 'Welcome to PrepGenie',
    description: 'Get started with your learning journey',
    category: 'onboarding',
    context: ['dashboard'],
    priority: 1,
    estimatedDuration: 3,
    lastUpdated: '2024-12-01',
    tags: ['beginner', 'overview'],
    steps: [
      {
        id: 'welcome-step-1',
        title: 'Welcome to Your Dashboard',
        content: 'This is your learning hub where you can see your progress, quick actions, and recent activity.',
        target: '[data-guide="dashboard-main"]',
        position: 'center'
      },
      {
        id: 'welcome-step-2',
        title: 'Quick Actions',
        content: 'Use these buttons to quickly create notes, flashcards, or start a study session.',
        target: '[data-guide="quick-actions"]',
        position: 'bottom'
      },
      {
        id: 'welcome-step-3',
        title: 'Your Progress',
        content: 'Track your learning progress and see how you\'re improving over time.',
        target: '[data-guide="progress-section"]',
        position: 'top'
      }
    ]
  },
  {
    id: 'notes-creation',
    title: 'Creating Your First Note',
    description: 'Learn how to create and organize notes effectively',
    category: 'features',
    context: ['notes'],
    priority: 2,
    estimatedDuration: 5,
    lastUpdated: '2024-12-01',
    tags: ['notes', 'creation'],
    steps: [
      {
        id: 'notes-step-1',
        title: 'Add Note Button',
        content: 'Click here to create a new note. You can write manually or scan documents.',
        target: '[data-guide="add-note-button"]',
        position: 'bottom',
        action: 'click',
        actionText: 'Click the "Add Note" button to continue'
      },
      {
        id: 'notes-step-2',
        title: 'Note Title',
        content: 'Give your note a descriptive title that will help you find it later.',
        target: '[data-guide="note-title"]',
        position: 'bottom',
        action: 'input',
        actionText: 'Type a title for your note'
      },
      {
        id: 'notes-step-3',
        title: 'Note Content',
        content: 'Write your note content here. You can use formatting and add images.',
        target: '[data-guide="note-content"]',
        position: 'top',
        action: 'input',
        actionText: 'Add some content to your note'
      },
      {
        id: 'notes-step-4',
        title: 'Save Your Note',
        content: 'Don\'t forget to save your note when you\'re done.',
        target: '[data-guide="save-note"]',
        position: 'bottom',
        action: 'click',
        actionText: 'Click save to store your note'
      }
    ]
  },
  {
    id: 'flashcards-study',
    title: 'Studying with Flashcards',
    description: 'Learn how to effectively study using flashcards',
    category: 'features',
    context: ['flashcards', 'study'],
    priority: 3,
    estimatedDuration: 4,
    lastUpdated: '2024-12-01',
    tags: ['flashcards', 'study'],
    steps: [
      {
        id: 'flashcards-step-1',
        title: 'Select a Flashcard Set',
        content: 'Choose a flashcard set you want to study from your collection.',
        target: '[data-guide="flashcard-sets"]',
        position: 'top'
      },
      {
        id: 'flashcards-step-2',
        title: 'Start Study Session',
        content: 'Click the study button to begin your flashcard session.',
        target: '[data-guide="study-button"]',
        position: 'bottom',
        action: 'click',
        actionText: 'Click "Study" to start'
      },
      {
        id: 'flashcards-step-3',
        title: 'Review and Rate',
        content: 'Read the question, think of the answer, then reveal and rate your confidence.',
        target: '[data-guide="flashcard-rating"]',
        position: 'bottom'
      }
    ]
  }
];

export const getGuidesForContext = (context: GuideContext): Guide[] => {
  return guideContent.filter(guide => 
    guide.context.includes(context)
  ).sort((a, b) => a.priority - b.priority);
};

export const getGuideById = (id: string): Guide | undefined => {
  return guideContent.find(guide => guide.id === id);
};

export const getOnboardingGuides = (): Guide[] => {
  return guideContent.filter(guide => 
    guide.category === 'onboarding'
  ).sort((a, b) => a.priority - b.priority);
};
