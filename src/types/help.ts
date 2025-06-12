
export interface HelpContent {
  id: string;
  title: string;
  description: string;
  category: HelpCategory;
  context: HelpContext[];
  priority: number;
  textContent?: string;
  videoContent?: VideoContent;
  quickTips?: string[];
  tags: string[];
  lastUpdated: string;
}

export interface VideoContent {
  youtubeId: string;
  title: string;
  duration: string;
  thumbnail?: string;
  chapters?: VideoChapter[];
  transcript?: string;
}

export interface VideoChapter {
  time: number;
  title: string;
  description?: string;
}

export type HelpCategory = 
  | 'getting-started'
  | 'notes'
  | 'flashcards'
  | 'study-sessions'
  | 'progress'
  | 'settings'
  | 'advanced';

export type HelpContext = 
  | 'dashboard'
  | 'notes-list'
  | 'note-creation'
  | 'note-editing'
  | 'note-study'
  | 'flashcards-list'
  | 'flashcard-creation'
  | 'flashcard-study'
  | 'study-session'
  | 'progress-overview'
  | 'settings'
  | 'import'
  | 'export';

export interface HelpState {
  isOpen: boolean;
  currentContent: HelpContent | null;
  currentContext: HelpContext | null;
  searchTerm: string;
  activeCategory: HelpCategory | null;
  viewMode: 'text' | 'video' | 'tips';
}
