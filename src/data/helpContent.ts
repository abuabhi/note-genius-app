
import { HelpContent } from '@/types/help';

export const helpContent: HelpContent[] = [
  {
    id: 'dashboard-overview',
    title: 'Understanding Your Dashboard',
    description: 'Learn how to navigate and use your PrepGenie dashboard effectively',
    category: 'getting-started',
    context: ['dashboard'],
    priority: 1,
    textContent: 'Your dashboard is your central hub for all study activities. Here you can view your recent notes, track study progress, and access quick actions for creating new content.',
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual video IDs
      title: 'Dashboard Tour - PrepGenie',
      duration: '3:45',
      chapters: [
        { time: 0, title: 'Welcome Banner', description: 'Overview of daily stats' },
        { time: 45, title: 'Quick Actions', description: 'Creating notes and flashcards' },
        { time: 120, title: 'Recent Activity', description: 'Tracking your progress' }
      ]
    },
    quickTips: [
      'Use the welcome banner to see your daily study time',
      'Quick actions provide fastest way to create content',
      'Recent activity shows your latest study sessions'
    ],
    tags: ['dashboard', 'overview', 'getting-started'],
    lastUpdated: '2024-12-12'
  },
  {
    id: 'create-note',
    title: 'How to Create Notes',
    description: 'Step-by-step guide to creating and organizing your study notes',
    category: 'notes',
    context: ['notes-list', 'note-creation'],
    priority: 2,
    textContent: 'Creating notes in PrepGenie is simple. Click the "Add Note" button, choose your creation method (manual, scan, or import), fill in the details, and save.',
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Creating Your First Note',
      duration: '4:20',
      chapters: [
        { time: 0, title: 'Manual Note Creation', description: 'Writing notes from scratch' },
        { time: 90, title: 'Scanning Documents', description: 'Using camera to capture text' },
        { time: 180, title: 'Importing Files', description: 'Upload PDFs and documents' }
      ]
    },
    quickTips: [
      'Use subjects to organize your notes',
      'Add tags for better searchability',
      'Save drafts with Ctrl+S'
    ],
    tags: ['notes', 'creation', 'manual', 'scan', 'import'],
    lastUpdated: '2024-12-12'
  },
  {
    id: 'study-sessions',
    title: 'Understanding Study Sessions',
    description: 'Learn how to start, track, and optimize your study sessions',
    category: 'study-sessions',
    context: ['study-session'],
    priority: 3,
    textContent: 'Study sessions help you track focused study time. Start a session when you begin studying, and PrepGenie will track your time and provide analytics.',
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Mastering Study Sessions',
      duration: '5:10',
      chapters: [
        { time: 0, title: 'Starting a Session', description: 'How to begin tracking' },
        { time: 120, title: 'Session Features', description: 'Timer and focus tools' },
        { time: 240, title: 'Ending Sessions', description: 'Reviewing your progress' }
      ]
    },
    quickTips: [
      'Set specific goals for each session',
      'Use the floating timer to track time',
      'Review session analytics for insights'
    ],
    tags: ['study-sessions', 'tracking', 'timer', 'analytics'],
    lastUpdated: '2024-12-12'
  },
  {
    id: 'import-notes',
    title: 'Importing Notes from Other Sources',
    description: 'Learn how to import notes from PDFs, documents, and other platforms',
    category: 'notes',
    context: ['import', 'note-creation'],
    priority: 4,
    textContent: 'PrepGenie supports multiple import methods including PDF upload, document scanning, and integration with popular note-taking apps.',
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Complete Import Guide',
      duration: '6:30',
      chapters: [
        { time: 0, title: 'PDF Import', description: 'Uploading and processing PDFs' },
        { time: 150, title: 'Document Scanning', description: 'Camera-based import' },
        { time: 300, title: 'Bulk Import', description: 'Multiple files at once' }
      ]
    },
    quickTips: [
      'Ensure PDFs are text-selectable for best results',
      'Use good lighting when scanning documents',
      'Organize imports by subject before uploading'
    ],
    tags: ['import', 'pdf', 'scanning', 'bulk-upload'],
    lastUpdated: '2024-12-12'
  }
];

export const getHelpByContext = (context: string): HelpContent[] => {
  return helpContent.filter(content => 
    content.context.includes(context as any)
  ).sort((a, b) => a.priority - b.priority);
};

export const getHelpByCategory = (category: string): HelpContent[] => {
  return helpContent.filter(content => 
    content.category === category
  ).sort((a, b) => a.priority - b.priority);
};

export const searchHelp = (query: string): HelpContent[] => {
  const lowerQuery = query.toLowerCase();
  return helpContent.filter(content =>
    content.title.toLowerCase().includes(lowerQuery) ||
    content.description.toLowerCase().includes(lowerQuery) ||
    content.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    content.textContent?.toLowerCase().includes(lowerQuery)
  ).sort((a, b) => a.priority - b.priority);
};
