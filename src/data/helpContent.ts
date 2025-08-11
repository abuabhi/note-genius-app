
import { HelpContent } from '@/types/help';

export const helpContent: HelpContent[] = [
  // Getting Started Section
  {
    id: 'dashboard-overview',
    title: 'Understanding Your Dashboard',
    description: 'Learn how to navigate and use your PrepGenie dashboard effectively',
    category: 'getting-started',
    context: ['dashboard'],
    priority: 1,
    textContent: `Your dashboard is your central hub for all study activities. Here you can:

• **Welcome Banner**: View your daily study statistics and progress
• **Quick Actions**: Fast access to create notes, flashcards, and start study sessions
• **Recent Activity**: Track your latest study sessions and achievements
• **Today's Focus**: See reminders, overdue items, and daily goals
• **Study Analytics**: Monitor your progress with detailed charts and insights

**Navigation Tips:**
- Use the sidebar to access different sections of the app
- The floating help button provides contextual assistance
- Reminders appear in the top navigation bar
- Your profile and settings are accessible from the user menu`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Dashboard Tour - PrepGenie',
      duration: '4:30',
      chapters: [
        { time: 0, title: 'Welcome Banner Overview', description: 'Daily stats and progress' },
        { time: 60, title: 'Quick Actions Guide', description: 'Creating content quickly' },
        { time: 150, title: 'Navigation & Sidebar', description: 'Moving around the app' },
        { time: 210, title: 'Today\'s Focus Section', description: 'Managing daily tasks' }
      ]
    },
    quickTips: [
      'Check your daily stats in the welcome banner each morning',
      'Use quick actions for fastest content creation',
      'Enable notifications to stay on top of reminders',
      'Customize your dashboard layout in settings'
    ],
    tags: ['dashboard', 'overview', 'navigation', 'getting-started'],
    lastUpdated: '2024-12-30'
  },

  // Notes Section
  {
    id: 'create-notes-comprehensive',
    title: 'Complete Guide to Creating Notes',
    description: 'Master all methods of creating and organizing notes in PrepGenie',
    category: 'notes',
    context: ['notes-list', 'note-creation'],
    priority: 2,
    textContent: `PrepGenie offers multiple ways to create notes:

**Manual Creation:**
1. Click "Add Note" button
2. Choose "Create Manually"
3. Fill in title, subject, and content
4. Add tags for better organization
5. Save your note

**Document Scanning (OCR):**
1. Click "Add Note" → "Scan Document"
2. Take photo or upload image
3. Select OCR language if needed
4. Review extracted text
5. Edit and save the note

**File Import:**
1. Click "Add Note" → "Import File"
2. Upload PDF, DOCX, or TXT files
3. Choose processing options
4. Review imported content
5. Organize and save

**Bulk Import:**
1. Access "Import" from the dropdown
2. Select multiple files
3. Choose batch processing settings
4. Review all imported notes
5. Apply bulk tags and subjects

**Best Practices:**
- Use consistent naming conventions
- Add relevant tags for searchability
- Organize by subject for easy access
- Include source information for references`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Complete Note Creation Guide',
      duration: '8:15',
      chapters: [
        { time: 0, title: 'Manual Note Creation', description: 'Step-by-step manual process' },
        { time: 120, title: 'OCR Scanning Features', description: 'Document scanning and extraction' },
        { time: 300, title: 'File Import Methods', description: 'Uploading and processing files' },
        { time: 480, title: 'Bulk Import Tips', description: 'Handling multiple files efficiently' }
      ]
    },
    quickTips: [
      'Use clear, descriptive titles for easy searching',
      'Scan documents in good lighting for better OCR results',
      'Tag notes immediately after creation',
      'Use subjects to group related notes together'
    ],
    tags: ['notes', 'creation', 'ocr', 'import', 'scanning'],
    lastUpdated: '2024-12-30'
  },

  {
    id: 'ai-note-enhancement',
    title: 'AI-Powered Note Enhancement',
    description: 'Transform your notes with AI-powered summaries, explanations, and improvements',
    category: 'ai-features',
    context: ['note-study', 'note-editing'],
    priority: 3,
    textContent: `PrepGenie's AI enhancement features help you get more from your notes:

**Available Enhancements:**
• **Smart Summary**: Generate concise summaries of long notes
• **Detailed Explanation**: Get in-depth explanations of complex topics
• **Key Points**: Extract the most important information
• **Study Questions**: Generate practice questions from your content
• **Spelling & Grammar**: Improve writing quality automatically

**How to Use AI Enhancements:**
1. Open any note in study view
2. Click the "Enhance" dropdown in the header
3. Select the type of enhancement you want
4. Wait for AI processing (usually 10-30 seconds)
5. Review and apply the enhancement

**Enhancement Tabs:**
- **Original**: Your original note content
- **Summary**: AI-generated summary
- **Explanation**: Detailed explanations
- **Key Points**: Essential information highlighted
- **Questions**: Practice questions for self-testing

**Tips for Best Results:**
- Use clear, well-structured notes as input
- Longer notes generally produce better summaries
- Review AI suggestions before applying them
- Combine multiple enhancement types for comprehensive study materials`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'AI Note Enhancement Tutorial',
      duration: '6:45',
      chapters: [
        { time: 0, title: 'Enhancement Overview', description: 'Available AI features' },
        { time: 90, title: 'Using Enhancement Tools', description: 'Step-by-step process' },
        { time: 240, title: 'Enhancement Types', description: 'Different enhancement options' },
        { time: 360, title: 'Best Practices', description: 'Getting optimal results' }
      ]
    },
    quickTips: [
      'Start with well-written, structured notes for best AI results',
      'Use multiple enhancement types for comprehensive study materials',
      'Review AI suggestions before applying them to your notes',
      'Longer notes typically produce better summaries and explanations'
    ],
    tags: ['ai', 'enhancement', 'summary', 'explanation', 'study'],
    lastUpdated: '2024-12-30'
  },

  {
    id: 'ai-note-chat',
    title: 'Interactive AI Note Chat',
    description: 'Chat with AI about your notes to deepen understanding and get instant answers',
    category: 'ai-features',
    context: ['note-study'],
    priority: 4,
    textContent: `The AI Note Chat feature allows you to have interactive conversations about your study materials:

**Getting Started:**
1. Open any note in study view
2. Click the chat icon in the sidebar or use the toggle button
3. Start asking questions about your note content
4. Get instant, contextual responses

**What You Can Ask:**
• **Clarification Questions**: "What does this concept mean?"
• **Examples**: "Can you give me an example of this?"
• **Connections**: "How does this relate to [other concept]?"
• **Practice Questions**: "Test my understanding of this topic"
• **Explanations**: "Explain this in simpler terms"
• **Applications**: "How is this used in real life?"

**Chat Features:**
- **Context Awareness**: AI knows your note content
- **Follow-up Questions**: Continue conversations naturally
- **Smart Suggestions**: Get recommended questions to ask
- **Flashcard Generation**: Create flashcards from chat conversations
- **Citation Support**: AI references your note content

**Advanced Chat Techniques:**
- Ask for step-by-step explanations
- Request different perspectives on topics
- Generate practice scenarios
- Create study plans based on note content
- Get help with difficult concepts

**Chat History:**
- All conversations are saved with your notes
- Access previous chat sessions anytime
- Search through chat history
- Export important conversations`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'AI Note Chat Masterclass',
      duration: '7:20',
      chapters: [
        { time: 0, title: 'Chat Setup', description: 'Starting your first chat session' },
        { time: 100, title: 'Effective Questions', description: 'How to ask the right questions' },
        { time: 280, title: 'Advanced Features', description: 'Flashcard generation and more' },
        { time: 420, title: 'Chat History', description: 'Managing and accessing conversations' }
      ]
    },
    quickTips: [
      'Ask specific questions for more detailed answers',
      'Use the chat to test your understanding of concepts',
      'Generate flashcards directly from chat conversations',
      'Review chat history before exams for quick revision'
    ],
    tags: ['ai', 'chat', 'interactive', 'questions', 'study-assistant'],
    lastUpdated: '2024-12-30'
  },

  // Flashcards Section
  {
    id: 'flashcard-creation-mastery',
    title: 'Master Flashcard Creation',
    description: 'Learn all methods to create effective flashcards for optimal studying',
    category: 'flashcards',
    context: ['flashcards-list', 'flashcard-creation'],
    priority: 5,
    textContent: `PrepGenie offers multiple ways to create flashcards:

**Manual Creation:**
1. Go to Flashcards section
2. Click "Create Set" or "Add Flashcard"
3. Enter front and back content
4. Add images, formatting, or audio if needed
5. Organize into sets by topic

**AI-Generated from Notes:**
1. Open any note in study view
2. Click "Convert to Flashcards"
3. Select content portions to convert
4. Choose flashcard type (basic, cloze, multiple choice)
5. Review and edit generated cards

**Import from Files:**
1. Use CSV import feature
2. Format: Front, Back, Tags, Notes
3. Upload your CSV file
4. Review and organize imported cards

**Flashcard Types:**
• **Basic**: Question/answer format
• **Cloze Deletion**: Fill-in-the-blank style
• **Multiple Choice**: Question with options
• **Image-based**: Visual learning cards
• **Audio**: Pronunciation and listening practice

**Best Practices:**
- Keep cards simple and focused
- Use images when possible
- Create cards immediately after learning
- Review and update cards regularly
- Use spaced repetition for optimal retention

**Organization Tips:**
- Group cards into logical sets
- Use consistent naming conventions
- Tag cards for easy filtering
- Create subject-specific collections`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Flashcard Creation Complete Guide',
      duration: '9:30',
      chapters: [
        { time: 0, title: 'Manual Creation', description: 'Creating cards from scratch' },
        { time: 150, title: 'AI Generation', description: 'Converting notes to flashcards' },
        { time: 350, title: 'Import Methods', description: 'Bulk importing flashcards' },
        { time: 500, title: 'Organization', description: 'Managing flashcard collections' }
      ]
    },
    quickTips: [
      'Create cards immediately after learning new concepts',
      'Use images and visual cues when possible',
      'Keep flashcards simple and focused on one concept',
      'Review cards regularly using spaced repetition'
    ],
    tags: ['flashcards', 'creation', 'ai-generation', 'import', 'study-cards'],
    lastUpdated: '2024-12-30'
  },

  // Reminders System
  {
    id: 'reminder-system-guide',
    title: 'Complete Reminders System Guide',
    description: 'Master the reminder system to stay on top of your study schedule',
    category: 'reminders',
    context: ['dashboard'],
    priority: 6,
    textContent: `PrepGenie's reminder system helps you stay organized and on track:

**Types of Reminders:**
• **Study Events**: Scheduled study sessions
• **Goal Deadlines**: Important milestone dates
• **Flashcard Reviews**: Spaced repetition reminders
• **Todo Items**: Task-based reminders
• **Custom Reminders**: Personalized notifications

**Creating Reminders:**
1. Click the bell icon in the navigation
2. Select "Add Reminder" or use quick creation
3. Choose reminder type and set details
4. Set date, time, and recurrence options
5. Configure notification preferences

**Reminder Management:**
- View all reminders in the navigation popover
- Mark reminders as complete or dismiss them
- Use batch actions for multiple reminders
- Set up recurring reminders for regular tasks

**Notification Settings:**
- Browser notifications for immediate alerts
- Email reminders for important deadlines
- In-app notifications with sound alerts
- Mobile push notifications (if enabled)

**Smart Features:**
- Automatic reminders for overdue flashcard reviews
- Goal deadline notifications
- Study session reminders based on your schedule
- Adaptive timing based on your study patterns

**Best Practices:**
- Set reminders 15-30 minutes before study sessions
- Use recurring reminders for regular study blocks
- Review and update reminders weekly
- Don't over-schedule - leave buffer time between tasks`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Reminders System Tutorial',
      duration: '5:45',
      chapters: [
        { time: 0, title: 'Reminder Types', description: 'Different reminder categories' },
        { time: 120, title: 'Creating Reminders', description: 'Step-by-step creation process' },
        { time: 240, title: 'Management Features', description: 'Organizing and handling reminders' },
        { time: 360, title: 'Notification Settings', description: 'Customizing alerts and preferences' }
      ]
    },
    quickTips: [
      'Set reminders 15-30 minutes before study sessions',
      'Use recurring reminders for regular study blocks',
      'Review overdue reminders daily to stay on track',
      'Customize notification settings for your preferences'
    ],
    tags: ['reminders', 'notifications', 'scheduling', 'study-planning', 'time-management'],
    lastUpdated: '2024-12-30'
  },

  // Import & Export
  {
    id: 'advanced-import-export',
    title: 'Advanced Import & Export Guide',
    description: 'Master all import and export features for seamless content management',
    category: 'import-export',
    context: ['import', 'export'],
    priority: 7,
    textContent: `PrepGenie supports comprehensive import and export capabilities:

**Import Methods:**

**File Import:**
- PDF files (with text extraction)
- Word documents (.docx)
- Text files (.txt)
- PowerPoint presentations (.pptx)
- Image files (with OCR processing)

**Bulk Import:**
- Multiple files at once
- Batch processing options
- Automatic organization by subject
- Tag application during import

**API Integrations:**
- Google Docs integration
- Notion workspace import
- Evernote migration
- OneNote synchronization

**OCR Scanning:**
- Camera-based document capture
- Image upload with text extraction
- Multiple language support
- Handwriting recognition (basic)

**CSV Import:**
- Flashcards from spreadsheets
- Notes with metadata
- Quiz questions and answers
- Study schedules and reminders

**Export Options:**

**Individual Exports:**
- PDF generation for notes
- Flashcard sets to various formats
- Study progress reports
- Quiz results and analytics

**Bulk Exports:**
- All notes by subject
- Complete flashcard collections
- Study session data
- Progress analytics data

**Export & Organization:**
- Share individual notes or sets
- Export for offline study
- Generate study materials
- Create printable study guides

**Best Practices:**
- Organize files before bulk import
- Use consistent naming conventions
- Review imported content for accuracy
- Backup your data regularly through exports`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Import & Export Masterclass',
      duration: '11:20',
      chapters: [
        { time: 0, title: 'File Import Basics', description: 'Importing various file types' },
        { time: 200, title: 'Bulk Import Process', description: 'Handling multiple files efficiently' },
        { time: 400, title: 'API Integrations', description: 'Connecting external services' },
        { time: 600, title: 'Export Options', description: 'Sharing and backing up content' }
      ]
    },
    quickTips: [
      'Use bulk import for large collections of study materials',
      'Review OCR results for accuracy before saving',
      'Export your data regularly as backup',
      'Use API integrations to sync with other tools you use'
    ],
    tags: ['import', 'export', 'ocr', 'bulk-processing', 'file-management'],
    lastUpdated: '2024-12-30'
  },

  // Study Sessions & Analytics
  {
    id: 'study-sessions-analytics',
    title: 'Study Sessions & Analytics Deep Dive',
    description: 'Maximize your study effectiveness with detailed session tracking and analytics',
    category: 'analytics',
    context: ['study-session', 'progress-overview'],
    priority: 8,
    textContent: `PrepGenie's study tracking provides comprehensive insights into your learning:

**Study Sessions:**

**Starting Sessions:**
1. Click "Start Study Session" from dashboard
2. Select subjects or materials to focus on
3. Set session duration and goals
4. Begin focused studying with timer tracking
5. End session with summary and reflection

**Session Features:**
- Pomodoro timer integration
- Break reminders and suggestions
- Distraction blocking (focus mode)
- Real-time progress tracking
- Session notes and reflections

**Analytics & Insights:**

**Progress Tracking:**
- Daily, weekly, and monthly study time
- Subject-wise time distribution
- Learning velocity and consistency
- Goal completion rates
- Streak tracking and motivation

**Performance Metrics:**
- Flashcard review accuracy
- Quiz scores and improvement trends
- Note creation and study patterns
- Peak performance times identification
- Study efficiency calculations

**Visual Analytics:**
- Interactive charts and graphs
- Heat maps of study activity
- Progress trend lines
- Comparative performance analysis
- Achievement milestone tracking

**Recommendations:**
- Personalized study schedule suggestions
- Optimal study time recommendations
- Subject priority recommendations
- Break timing optimization
- Goal adjustment suggestions

**Reports & Exports:**
- Weekly and monthly study reports
- Performance summary PDFs
- Progress sharing with instructors
- Data export for external analysis
- Custom report generation

**Using Analytics for Improvement:**
- Identify peak performance times
- Adjust study schedules based on data
- Focus on underperforming subjects
- Celebrate achievements and milestones
- Set data-driven goals for improvement`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Study Analytics & Session Management',
      duration: '8:55',
      chapters: [
        { time: 0, title: 'Study Sessions', description: 'Starting and managing study sessions' },
        { time: 180, title: 'Analytics Overview', description: 'Understanding your study data' },
        { time: 360, title: 'Performance Metrics', description: 'Key metrics for improvement' },
        { time: 480, title: 'Using Insights', description: 'Applying analytics to improve study habits' }
      ]
    },
    quickTips: [
      'Start study sessions to track your focused study time',
      'Review weekly analytics to identify patterns',
      'Use performance data to optimize your study schedule',
      'Set achievable goals based on your analytics trends'
    ],
    tags: ['study-sessions', 'analytics', 'tracking', 'performance', 'insights'],
    lastUpdated: '2024-12-30'
  },

  // Advanced Features
  {
    id: 'advanced-study-features',
    title: 'Advanced Study Features',
    description: 'Explore advanced features for power users and study optimization',
    category: 'advanced',
    context: ['settings'],
    priority: 9,
    textContent: `Unlock PrepGenie's advanced features for enhanced studying:

**Advanced Note Features:**
- Real-time collaborative editing
- Version history and change tracking
- Advanced formatting and LaTeX support
- Template creation and management
- Custom note categories and workflows

**Flashcard Advanced Options:**
- Spaced repetition algorithms
- Difficulty adjustment based on performance
- Custom card types and templates
- Advanced scheduling options
- Batch editing and management tools

**AI Integration:**
- Custom AI prompts for note enhancement
- Advanced chat commands and shortcuts
- AI-powered study plan generation
- Automated content recommendations
- Performance-based AI suggestions

**Customization Options:**
- Custom themes and color schemes
- Personalized dashboard layouts
- Advanced keyboard shortcuts
- Custom notification settings
- Workflow automation rules

**Integration Features:**
- Calendar integration for study scheduling
- Third-party app connections
- API access for custom integrations
- Webhook support for automation
- Data synchronization across devices

**Performance Optimization:**
- Offline mode for studying anywhere
- Advanced caching for faster loading
- Bandwidth optimization settings
- Performance monitoring tools
- Resource usage optimization

**Security & Privacy:**
- Advanced encryption options
- Privacy control settings
- Data export and portability
- Account security features
- Compliance and data protection

**Study Group Features:**
- Collaborative study spaces
- Shared flashcard sets
- Group study sessions
- Progress comparison tools
- Team-based challenges and goals`,
    videoContent: {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Advanced Features Tour',
      duration: '12:30',
      chapters: [
        { time: 0, title: 'Advanced Note Features', description: 'Power user note capabilities' },
        { time: 240, title: 'Flashcard Advanced Options', description: 'Sophisticated flashcard management' },
        { time: 480, title: 'AI Integration', description: 'Advanced AI features and customization' },
        { time: 720, title: 'Customization & Integration', description: 'Personalizing your experience' }
      ]
    },
    quickTips: [
      'Explore keyboard shortcuts for faster navigation',
      'Customize your dashboard for optimal workflow',
      'Use collaborative features for group study',
      'Enable offline mode for studying anywhere'
    ],
    tags: ['advanced', 'customization', 'integration', 'collaboration', 'power-user'],
    lastUpdated: '2024-12-30'
  },

  // Troubleshooting
  {
    id: 'troubleshooting-guide',
    title: 'Troubleshooting Common Issues',
    description: 'Solve common problems and optimize your PrepGenie experience',
    category: 'advanced',
    context: ['settings'],
    priority: 10,
    textContent: `Common issues and solutions for PrepGenie:

**Login & Account Issues:**
- Password reset procedures
- Two-factor authentication setup
- Account recovery options
- Email verification problems
- Session timeout issues

**Performance Issues:**
- Slow loading times solutions
- Browser compatibility requirements
- Cache clearing procedures
- Network connectivity troubleshooting
- Memory usage optimization

**Import/Export Problems:**
- File format compatibility
- OCR accuracy improvement tips
- Large file handling
- Import error resolution
- Export formatting issues

**Synchronization Issues:**
- Data sync across devices
- Offline mode limitations
- Conflict resolution procedures
- Backup and restore options
- Real-time update problems

**AI Feature Issues:**
- Enhancement processing failures
- Chat response delays
- API rate limiting
- Quality improvement suggestions
- Feature availability by plan

**Mobile & Browser Issues:**
- Responsive design problems
- Touch interface optimization
- Browser-specific issues
- Mobile app limitations
- Cross-platform compatibility

**Study Features:**
- Timer accuracy issues
- Notification delivery problems
- Analytics data discrepancies
- Flashcard sync issues
- Progress tracking errors

**Getting Help:**
- Using the help system effectively
- Contacting support
- Community forums and resources
- Feature request procedures
- Bug reporting guidelines`,
    quickTips: [
      'Clear browser cache if experiencing loading issues',
      'Check internet connection for sync problems',
      'Update your browser for best compatibility',
      'Contact support for persistent issues'
    ],
    tags: ['troubleshooting', 'issues', 'support', 'problems', 'solutions'],
    lastUpdated: '2024-12-30'
  },
  {
    id: 'import-flashcards-notes',
    title: 'Import Notes and Flashcards',
    description: 'Bring your existing notes and flashcards into the app quickly and safely',
    category: 'import-export',
    context: ['import'],
    priority: 1,
    textContent: `Notes: PDF, DOCX, TXT, PPTX; OCR for images.

• Flashcards: CSV with columns Front, Back, Tags, Notes.

Steps:
1) Open Import.
2) Choose file(s).
3) Pick processing: OCR, subject, tags.
4) Review and save.

Best Practices:
- Use good lighting for OCR images.
- Keep consistent file names.
- Confirm subjects/tags after import.`,
    quickTips: [
      'Use batch import for multiple files',
      'Review OCR text before saving',
      'Tag immediately for easier search'
    ],
    tags: ['import', 'ocr', 'csv', 'notes', 'flashcards'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'export-data-guide',
    title: 'Export Your Data',
    description: 'Export notes, flashcards, and analytics for backup or sharing',
    category: 'import-export',
    context: ['export'],
    priority: 2,
    textContent: `Export options:
- Notes → PDF/DOCX
- Flashcards → CSV
- Analytics → PDF summary

Steps:
1) Open Export.
2) Select items or filters.
3) Choose format.
4) Download or share.

Best Practices:
- Keep periodic backups.
- Export sets by subject.
- Use analytics reports for check-ins.`,
    quickTips: [
      'Export before major edits',
      'Use subject filters',
      'Keep weekly analytics PDFs'
    ],
    tags: ['export', 'backup', 'pdf', 'csv'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'import-troubleshooting',
    title: 'Troubleshooting Imports',
    description: 'Fix common import issues (format, encoding, large files)',
    category: 'import-export',
    context: ['import'],
    priority: 3,
    textContent: `CSV: Ensure header order and UTF-8 encoding.
DOCX/PDF: Remove password protection.
Images: Use clear scans.
Large batches: Split into smaller sets.

Tip: Try one file first to isolate issues.`,
    quickTips: [
      'Validate CSV before upload',
      'Avoid scanned PDFs when possible',
      'Import in smaller batches'
    ],
    tags: ['troubleshooting', 'import', 'csv', 'ocr'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'analytics-overview',
    title: 'Analytics Overview',
    description: 'Understand key metrics and trends',
    category: 'analytics',
    context: ['dashboard', 'progress-overview'],
    priority: 1,
    textContent: `Metrics: total sessions, total time, average time, streak days, accuracy, quiz scores, learning velocity.

Tips:
- Review weekly to adjust your plan.
- Focus on underperforming subjects.
- Track your peak study times.`,
    quickTips: [
      'Use weekly view for trends',
      'Compare subjects',
      'Act on low-accuracy topics'
    ],
    tags: ['analytics', 'overview', 'performance'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'analytics-improve-habits',
    title: 'Use Analytics to Improve Habits',
    description: 'Turn data into better results',
    category: 'analytics',
    context: ['progress-overview', 'study-session'],
    priority: 2,
    textContent: `1) Identify low-accuracy cards and schedule extra reviews.
2) Shift difficult topics to your peak time window.
3) Shorten long sessions if efficiency drops.
4) Create goals tied to measurable metrics.`,
    quickTips: [
      'Start with one metric',
      'Revisit after a week',
      'Celebrate milestones'
    ],
    tags: ['analytics', 'improvement', 'habits'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'study-start-manage',
    title: 'Starting and Managing Sessions',
    description: 'Start focused sessions with goals and timers',
    category: 'study-sessions',
    context: ['study-session', 'dashboard'],
    priority: 1,
    textContent: `Steps:
1) Start Session.
2) Pick subject/materials.
3) Set duration/goal.
4) Use focus timer; add notes.
5) End and review summary.

Best Practices:
- Keep sessions 25–50 minutes.
- Insert short breaks.
- Log quick reflections.`,
    quickTips: [
      'Start with a clear goal',
      'Small notes during session',
      'End with reflection'
    ],
    tags: ['sessions', 'timers', 'goals'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'study-focus-pomodoro',
    title: 'Focus Mode and Pomodoro',
    description: 'Stay on task with structured focus and breaks',
    category: 'study-sessions',
    context: ['study-session'],
    priority: 2,
    textContent: `Use Pomodoro: 25 min focus + 5 min break.
Turn on distraction-minimizing mode and break reminders.
Increase focus blocks gradually if comfortable.`,
    quickTips: [
      'Keep breaks truly off-task',
      'Stop at the bell',
      'Batch similar topics'
    ],
    tags: ['focus', 'pomodoro', 'productivity'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'study-link-goals',
    title: 'Link Sessions to Goals and Materials',
    description: 'Track effort where it matters',
    category: 'study-sessions',
    context: ['study-session'],
    priority: 3,
    textContent: `Choose a goal or set when starting sessions.
Benefits: progress attribution, accurate analytics, easier weekly reviews.`,
    quickTips: [
      'Always link to a goal',
      'Use consistent subjects',
      'Review linked progress weekly'
    ],
    tags: ['sessions', 'goals', 'attribution'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'progress-dashboard',
    title: 'Progress Dashboard',
    description: 'Read and act on progress charts',
    category: 'progress',
    context: ['progress-overview', 'dashboard'],
    priority: 1,
    textContent: `See sessions, study time, streaks, subject split, accuracy, and quizzes.
Goal: rising accuracy and steady time. Use exports for check-ins.`,
    quickTips: [
      'Watch streaks',
      'Balance subjects',
      'Combine with goals'
    ],
    tags: ['progress', 'dashboard', 'trends'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'progress-streaks',
    title: 'Streaks and Consistency',
    description: 'Build reliable habits with streaks',
    category: 'progress',
    context: ['progress-overview'],
    priority: 2,
    textContent: `Aim for short daily sessions to keep streaks.
If you miss a day, resume next day and adjust targets—consistency beats intensity.`,
    quickTips: [
      'Minimum viable session',
      "Don't chase perfection",
      'Review weekly'
    ],
    tags: ['streaks', 'habits', 'consistency'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'settings-profile-preferences',
    title: 'Profile and Preferences',
    description: 'Update your profile, subjects, and UI preferences',
    category: 'settings',
    context: ['settings'],
    priority: 1,
    textContent: `Edit name, time zone, subjects, grade, and theme.
Calibrate time zone for analytics accuracy.
Keep subjects/grades current for better recommendations.`,
    quickTips: [
      'Set correct time zone',
      'Keep subjects clean',
      'Pick a readable theme'
    ],
    tags: ['settings', 'profile', 'subjects'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'settings-notifications-digest',
    title: 'Notifications and Email Digest',
    description: 'Control notification channels and the daily/weekly digest',
    category: 'settings',
    context: ['settings', 'reminders'],
    priority: 2,
    textContent: `Toggle digest (daily/weekly), set time, choose content (notes, flashcards, quizzes, sessions), urgent-only if needed.
Adjust in-app and browser notifications to your preference.`,
    quickTips: [
      'Digest in morning',
      'Urgent only during exams',
      'Review weekly'
    ],
    tags: ['settings', 'notifications', 'digest'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'advanced-shortcuts-tips',
    title: 'Keyboard Shortcuts and Power Tips',
    description: 'Navigate and act faster',
    category: 'advanced',
    context: ['settings'],
    priority: 3,
    textContent: `Common shortcuts: search, add note, start session, save.
Power tips: batch actions, templates, quick tagging.`,
    quickTips: [
      'Learn 3 shortcuts first',
      'Batch related tasks',
      'Create templates'
    ],
    tags: ['advanced', 'shortcuts', 'productivity'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'goals-creating-tracking',
    title: 'Creating and Tracking Study Goals',
    description: 'Set measurable goals and see progress clearly',
    category: 'goals-todos',
    context: ['dashboard', 'progress-overview'],
    priority: 1,
    textContent: `Steps:
1) Create goal with title, timeframe, target hours.
2) Link sessions.
3) Track percent complete and adjust weekly.

Best Practices: realistic targets, align to subjects, reflect after each session.`,
    quickTips: [
      'Start small',
      'Link every session',
      'Adjust weekly'
    ],
    tags: ['goals', 'planning', 'targets'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'todos-and-reminders',
    title: 'To-Dos and Reminders for Study',
    description: 'Manage tasks with due dates and recurring schedules',
    category: 'goals-todos',
    context: ['reminders', 'dashboard'],
    priority: 2,
    textContent: `Create to-dos with priority and due date.
Use recurring items for weekly reviews.
Mark done or reschedule—avoid overdue pileups.`,
    quickTips: [
      'Keep tasks small',
      'Review daily',
      'Use recurring for routines'
    ],
    tags: ['todos', 'reminders', 'tasks'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'templates-recurring-tasks',
    title: 'Templates for Recurring Study Tasks',
    description: 'Build once, reuse often',
    category: 'goals-todos',
    context: ['reminders'],
    priority: 3,
    textContent: `Create templates for: Weekly recap, Flashcard review, Practice quiz.
Apply templates to save time and maintain consistency.`,
    quickTips: [
      'Start with two templates',
      'Iterate monthly',
      'Track completion rate'
    ],
    tags: ['templates', 'routines', 'productivity'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'upgrade-plans-benefits',
    title: 'Upgrade Plans and Benefits',
    description: 'Choose the plan that fits your study style',
    category: 'upgrade',
    context: ['settings', 'dashboard'],
    priority: 1,
    textContent: `Benefits by tier: increased AI limits, advanced analytics, priority reminders, collaboration options.
Start with monthly; switch to annual for savings.`,
    quickTips: [
      'Trial first',
      'Annual for savings',
      'Match plan to workload'
    ],
    tags: ['upgrade', 'pricing', 'plans'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'upgrade-change-plan',
    title: 'How to Upgrade or Downgrade',
    description: 'Change your plan anytime from Settings',
    category: 'upgrade',
    context: ['settings'],
    priority: 2,
    textContent: `Steps:
1) Open Settings → Billing.
2) Choose new tier.
3) Confirm. Proration applies mid-cycle.
Downgrades usually take effect next cycle.`,
    quickTips: [
      'Review usage before change',
      'Check proration',
      'Download recent receipts'
    ],
    tags: ['billing', 'downgrade', 'change-plan'],
    lastUpdated: '2025-08-11'
  },
  {
    id: 'billing-receipts-refunds',
    title: 'Billing, Receipts, and Refunds',
    description: 'Manage invoices, payment methods, and refunds',
    category: 'upgrade',
    context: ['settings'],
    priority: 3,
    textContent: `Update payment method.
View/download invoices.
Refunds follow policy—contact support with order ID.
Keep your email up to date.`,
    quickTips: [
      'Save invoices',
      'Keep card valid',
      'Contact support early'
    ],
    tags: ['billing', 'receipts', 'refunds'],
    lastUpdated: '2025-08-11'
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

export const getFeaturedHelp = (): HelpContent[] => {
  return helpContent.filter(content => content.priority <= 5);
};

export const getPopularHelp = (): HelpContent[] => {
  return [
    ...getHelpByCategory('getting-started'),
    ...getHelpByCategory('ai-features').slice(0, 2),
    ...getHelpByCategory('notes').slice(0, 1),
    ...getHelpByCategory('flashcards').slice(0, 1)
  ];
};
