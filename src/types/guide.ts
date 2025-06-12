
export interface GuideStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll' | 'input';
  actionText?: string; // Text to display for the action
  optional?: boolean; // Whether this step can be skipped
  delay?: number; // Delay before showing this step (ms)
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  context: GuideContext[];
  steps: GuideStep[];
  priority: number;
  prerequisite?: string; // ID of guide that should be completed first
  tags: string[];
  estimatedDuration: number; // in minutes
  lastUpdated: string;
}

export type GuideCategory = 
  | 'onboarding'
  | 'features'
  | 'advanced'
  | 'troubleshooting';

export type GuideContext = 
  | 'dashboard'
  | 'notes'
  | 'flashcards'
  | 'study'
  | 'progress'
  | 'settings';

export interface GuideState {
  isActive: boolean;
  currentGuide: Guide | null;
  currentStepIndex: number;
  completedGuides: string[];
  dismissedGuides: string[];
  autoStartEnabled: boolean;
}

export interface GuideProgress {
  guideId: string;
  userId: string;
  currentStep: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  skipped: boolean;
}
