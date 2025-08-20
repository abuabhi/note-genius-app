-- Clear existing help topics and sections
DELETE FROM public.help_topic_sections;
DELETE FROM public.help_topics;

-- Insert comprehensive help topics with proper categories and subtopics

-- ============= GETTING STARTED =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Welcome to StudyFlow', 'Learn the basics and get started with your learning journey', 'getting-started', 1, true, false),
('Account Setup', 'Complete your profile and initial setup', 'getting-started', 2, true, false),
('First Steps Tutorial', 'Essential actions to get started effectively', 'getting-started', 3, true, false),
('Navigation Guide', 'Learn to navigate the StudyFlow interface', 'getting-started', 4, true, false);

-- ============= NOTES =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Creating Notes Manually', 'Learn how to create and format notes from scratch', 'notes', 1, true, false),
('Importing PDF Documents', 'Convert PDF documents into editable notes', 'notes', 2, true, false),
('Importing Handwritten Notes', 'Convert handwritten notes using OCR technology', 'notes', 3, true, false),
('Importing from Google Docs', 'Seamlessly import your Google Docs', 'notes', 4, true, false),
('Converting YouTube Videos', 'Transform YouTube videos into structured notes', 'notes', 5, true, false),
('AI Note Enhancement', 'Improve your notes using AI-powered features', 'notes', 6, true, false),
('Note Chat Feature', 'Chat with your notes using AI', 'notes', 7, true, false),
('Converting Notes to Flashcards', 'Transform notes into effective flashcards', 'notes', 8, true, false),
('Note Organization', 'Organize and manage your note collection', 'notes', 9, true, false);

-- ============= FLASHCARDS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Creating Flashcard Sets', 'Build effective flashcard collections', 'flashcards', 1, true, false),
('Manual Flashcard Creation', 'Create flashcards from scratch', 'flashcards', 2, true, false),
('Auto-generating from Notes', 'Convert notes to flashcards automatically', 'flashcards', 3, true, false),
('Spaced Repetition System', 'Understanding the learning algorithm', 'flashcards', 4, true, false),
('Study Modes and Options', 'Different ways to study your flashcards', 'flashcards', 5, true, false),
('Progress Tracking', 'Monitor your flashcard learning progress', 'flashcards', 6, true, false),
('Sharing and Collaboration', 'Share flashcards with others', 'flashcards', 7, true, false);

-- ============= QUIZ =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Creating Custom Quizzes', 'Build your own quiz questions and answers', 'quiz', 1, true, false),
('Auto-generating Quizzes', 'Create quizzes automatically from notes', 'quiz', 2, true, false),
('Quiz Taking Interface', 'Navigate the quiz-taking experience', 'quiz', 3, true, false),
('Question Types and Formats', 'Understanding different quiz question types', 'quiz', 4, true, false),
('Quiz Results and Analysis', 'Interpret your quiz performance', 'quiz', 5, true, false),
('Timed vs Untimed Quizzes', 'Choose the right quiz format for your needs', 'quiz', 6, true, false),
('Quiz Sharing and Public Access', 'Share quizzes with other users', 'quiz', 7, true, false);

-- ============= STUDY SESSIONS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Starting Study Sessions', 'Begin focused study sessions', 'study-sessions', 1, true, false),
('Session Types and Modes', 'Different study session formats', 'study-sessions', 2, true, false),
('Pomodoro Technique Integration', 'Use built-in focus timers', 'study-sessions', 3, true, false),
('Session Progress Tracking', 'Monitor your study session effectiveness', 'study-sessions', 4, true, false),
('Study Music and Environment', 'Optimize your study environment', 'study-sessions', 5, true, false),
('Session Analytics', 'Understanding your study patterns', 'study-sessions', 6, true, false);

-- ============= GOALS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Creating Study Goals', 'Set up effective learning objectives', 'goals', 1, true, false),
('SMART Goal Framework', 'Create specific, measurable, achievable goals', 'goals', 2, true, false),
('Goal Progress Tracking', 'Monitor your progress toward objectives', 'goals', 3, true, false),
('Daily and Weekly Targets', 'Set short-term milestone goals', 'goals', 4, true, false),
('Subject-specific Goals', 'Create goals for different study areas', 'goals', 5, true, false),
('Goal Reminders and Notifications', 'Stay on track with automated reminders', 'goals', 6, true, false),
('Achievement System', 'Understand badges and rewards', 'goals', 7, true, false);

-- ============= TODOS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Creating Todo Items', 'Manage your study tasks effectively', 'todos', 1, true, false),
('Task Prioritization', 'Organize todos by importance and urgency', 'todos', 2, true, false),
('Due Dates and Scheduling', 'Set deadlines and schedule tasks', 'todos', 3, true, false),
('Task Categories and Tags', 'Organize todos with categories', 'todos', 4, true, false),
('Recurring Tasks', 'Set up repeating study tasks', 'todos', 5, true, false),
('Task Dependencies', 'Link related tasks together', 'todos', 6, true, false),
('Todo Analytics', 'Track task completion and productivity', 'todos', 7, true, false);

-- ============= PROGRESS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Dashboard Overview', 'Understanding your progress dashboard', 'progress', 1, true, false),
('Learning Streaks', 'Maintain consistent study habits', 'progress', 2, true, false),
('Performance Metrics', 'Key indicators of learning progress', 'progress', 3, true, false),
('Subject Progress Tracking', 'Monitor progress in different areas', 'progress', 4, true, false),
('Weekly and Monthly Reports', 'Review your learning journey', 'progress', 5, true, false),
('Comparative Analysis', 'Compare performance across time periods', 'progress', 6, true, false);

-- ============= SETTINGS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Account Information', 'Manage your profile and personal details', 'settings', 1, true, false),
('Adding and Deleting Subjects', 'Organize your study areas', 'settings', 2, true, false),
('Subscription Management', 'Handle your StudyFlow subscription', 'settings', 3, true, false),
('Notifications Management', 'Control alerts and reminders', 'settings', 4, true, false),
('Study Preferences', 'Customize your learning experience', 'settings', 5, true, false),
('Adaptive Learning Settings', 'Configure AI learning algorithms', 'settings', 6, true, false),
('Password and Security', 'Secure your account and data', 'settings', 7, true, false),
('Privacy Settings', 'Control your data and sharing preferences', 'settings', 8, true, false);

-- ============= AI FEATURES =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('AI Enhancement Overview', 'Understanding AI-powered features', 'ai-features', 1, true, false),
('Content Generation', 'Generate study materials with AI', 'ai-features', 2, true, false),
('Personalized Recommendations', 'Get AI-powered study suggestions', 'ai-features', 3, true, false),
('Adaptive Learning', 'How AI adapts to your learning style', 'ai-features', 4, true, false),
('AI Chat Assistant', 'Interact with the AI study assistant', 'ai-features', 5, true, false);

-- ============= REMINDERS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Setting Up Reminders', 'Create effective study reminders', 'reminders', 1, true, false),
('Reminder Types and Options', 'Different reminder formats and schedules', 'reminders', 2, true, false),
('Notification Preferences', 'Control how and when you receive reminders', 'reminders', 3, true, false),
('Study Schedule Reminders', 'Automate your study schedule', 'reminders', 4, true, false),
('Goal and Deadline Alerts', 'Stay on track with important dates', 'reminders', 5, true, false),
('Managing Reminder Overload', 'Balance notifications effectively', 'reminders', 6, true, false);

-- ============= IMPORT EXPORT =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Importing Study Materials', 'Bring existing content into StudyFlow', 'import-export', 1, true, false),
('Supported File Formats', 'Compatible import and export formats', 'import-export', 2, true, false),
('Bulk Import Operations', 'Import multiple files at once', 'import-export', 3, true, false),
('Exporting Your Data', 'Download your study materials', 'import-export', 4, true, false),
('Data Migration', 'Move from other study platforms', 'import-export', 5, true, false),
('Backup and Restore', 'Protect your study data', 'import-export', 6, true, false);

-- ============= ANALYTICS =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Analytics Dashboard', 'Overview of your learning analytics', 'analytics', 1, true, false),
('Study Time Tracking', 'Monitor time spent studying', 'analytics', 2, true, false),
('Performance Trends', 'Analyze your learning patterns over time', 'analytics', 3, true, false),
('Subject-wise Analytics', 'Compare performance across subjects', 'analytics', 4, true, false),
('Retention and Memory Metrics', 'Track how well you retain information', 'analytics', 5, true, false),
('Learning Velocity', 'Measure your learning speed and efficiency', 'analytics', 6, true, false),
('Predictive Insights', 'AI predictions about your learning', 'analytics', 7, true, false),
('Custom Reports', 'Generate personalized analytics reports', 'analytics', 8, true, false);

-- ============= UPGRADE =============
INSERT INTO public.help_topics (title, description, category, priority, is_active, show_video) VALUES
('Subscription Plans', 'Compare available StudyFlow plans', 'upgrade', 1, true, false),
('Premium Features', 'Exclusive features for premium users', 'upgrade', 2, true, false),
('Billing and Payments', 'Manage your subscription billing', 'upgrade', 3, true, false),
('Plan Upgrades and Downgrades', 'Change your subscription level', 'upgrade', 4, true, false);