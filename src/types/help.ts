export interface HelpTopicSection {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  image_urls?: string[];
  sort_order: number;
}

export interface HelpContent {
  id: string;
  title: string;
  description: string;
  category: HelpCategory;
  context: HelpContext[];
  priority: number;
  sections: HelpTopicSection[];
  videoContent?: VideoContent;
  quickTips?: string[];
  tags: string[];
  lastUpdated: string;
  show_video: boolean;
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
  | 'advanced'
  | 'ai-features'
  | 'reminders'
  | 'import-export'
  | 'analytics'
  | 'goals-todos'
  | 'upgrade';

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
  | 'export'
  | 'ai-chat'
  | 'note-enhancement'
  | 'reminders'
  | 'analytics';

export interface HelpState {
  isOpen: boolean;
  currentContent: HelpContent | null;
  currentContext: HelpContext | null;
  searchTerm: string;
  activeCategory: HelpCategory | null;
  viewMode: 'text' | 'video' | 'tips';
}