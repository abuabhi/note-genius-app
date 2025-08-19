-- Insert comprehensive help data into help_topics and help_topic_sections tables

-- First, let's clear existing data and insert new comprehensive help topics
DELETE FROM help_topic_sections;
DELETE FROM help_topics;

-- Insert comprehensive help topics with proper structure
-- Getting Started category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Welcome to StudyFlow', 'Learn the basics of StudyFlow and get started with your learning journey', 'getting-started', 1, false, true);

-- Notes category (comprehensive coverage)
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('How to Create Notes Manually', 'Learn how to create and format notes from scratch using our rich text editor', 'notes', 1, false, true),
('How to Import PDF Documents', 'Convert PDF documents into editable notes with automatic text extraction', 'notes', 2, false, true),
('How to Import Handwritten Notes', 'Convert handwritten notes to digital text using OCR technology', 'notes', 2, false, true),
('How to Import from Google Docs', 'Seamlessly import your Google Docs while preserving formatting and structure', 'notes', 2, false, true),
('How to Import from Microsoft OneNote', 'Transfer your OneNote pages and sections into StudyFlow notes', 'notes', 2, false, true),
('How to Convert YouTube Videos to Notes', 'Transform YouTube videos into structured, searchable notes automatically', 'notes', 3, false, true),
('How to Enhance Notes with AI', 'Improve your notes using AI-powered features for better learning outcomes', 'notes', 1, false, true),
('Understanding Enhancement Types', 'Learn the differences between various AI enhancement features and when to use each', 'notes', 2, false, true),
('How to Chat with Your Notes', 'Ask questions and get answers directly from your note content using AI chat', 'notes', 3, false, true),
('How to Convert Notes to Flashcards', 'Transform your notes into effective flashcards for spaced repetition learning', 'notes', 2, false, true),
('How to Convert Notes to Quizzes', 'Generate comprehensive quizzes from your note content for self-assessment', 'notes', 2, false, true);

-- Flashcards category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('How to Create Flashcards Manually', 'Learn to create effective flashcards from scratch with proven techniques', 'flashcards', 1, false, true),
('How to Generate Flashcards with AI', 'Use AI to automatically create flashcards from text, notes, or topics', 'flashcards', 2, false, true),
('Understanding Spaced Repetition', 'Master the science-backed study method for long-term retention', 'flashcards', 1, false, true),
('Effective Flashcard Study Strategies', 'Advanced techniques to maximize your flashcard study effectiveness', 'flashcards', 2, false, true);

-- New Quiz category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('How to Create Quizzes Manually', 'Build effective quizzes from scratch with various question types', 'quiz', 1, false, true),
('How to Generate Quizzes with AI', 'Use AI to automatically create comprehensive quizzes from your study materials', 'quiz', 2, false, true),
('Effective Quiz-Taking Strategies', 'Master techniques for taking quizzes effectively and learning from results', 'quiz', 1, false, true),
('Quiz Performance Analysis & Improvement', 'Learn to analyze quiz results and use insights to improve your study methods', 'quiz', 2, false, true);

-- Study Sessions category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Understanding Study Sessions', 'Learn about different study session types and how to maximize their effectiveness', 'study-sessions', 1, false, true);

-- Import-Export category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Import & Export Overview', 'Learn about all import and export options available in StudyFlow', 'import-export', 1, false, true);

-- AI Features category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('AI Features Overview', 'Discover all AI-powered features available to enhance your learning', 'ai-features', 1, false, true);

-- Settings category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Managing Account Settings', 'Customize your account preferences and personal information', 'settings', 1, false, true);

-- Upgrade category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Understanding Subscription Tiers', 'Compare features across different subscription levels and choose the right tier', 'upgrade', 1, false, true);

-- Progress category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Understanding Your Progress', 'Learn to interpret and use your learning analytics for better study outcomes', 'progress', 1, false, true);

-- Goals & Todos category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Managing Goals and Todos', 'Set, track, and achieve your learning goals with our integrated task management', 'goals-todos', 1, false, true);

-- Reminders category
INSERT INTO help_topics (title, description, category, priority, show_video, is_active) VALUES
('Setting Up Study Reminders', 'Configure reminders and notifications to stay on track with your learning schedule', 'reminders', 1, false, true);