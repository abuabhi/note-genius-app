
-- Phase 1: Clear User Data Tables (quiz-related user data)
DELETE FROM quiz_results;
DELETE FROM quiz_question_responses;
DELETE FROM quiz_card_responses;

-- Clear flashcard progress data
DELETE FROM user_flashcard_progress;
DELETE FROM simple_flashcard_progress;
DELETE FROM learning_progress;

-- Clear note-related data
DELETE FROM note_enrichment_usage;
DELETE FROM note_tags;
DELETE FROM scan_data;

-- Clear session data
DELETE FROM study_sessions;
DELETE FROM study_session_activities;

-- Clear note chat history
DELETE FROM note_chat_messages;

-- Phase 2: Clear Content Tables
-- Delete individual flashcards
DELETE FROM flashcards;

-- Delete flashcard collections
DELETE FROM flashcard_sets;

-- Delete quiz content
DELETE FROM quiz_questions;
DELETE FROM quiz_options;

-- Delete quiz definitions
DELETE FROM quizzes;

-- Delete user notes
DELETE FROM notes;

-- Phase 3: Reset Related Data
-- Clear study goals linked to deleted content
DELETE FROM study_goals WHERE flashcard_set_id IS NOT NULL;

-- Clear reminders related to deleted content (keeping general reminders)
DELETE FROM reminders WHERE type = 'study' AND (goal_id IS NOT NULL OR event_id IS NOT NULL);

-- Clear events related to flashcard sets
DELETE FROM events WHERE flashcard_set_id IS NOT NULL;

-- Clear test sessions and attempts
DELETE FROM test_question_attempts;
DELETE FROM test_sessions;

-- Clear quiz sessions
DELETE FROM quiz_sessions;

-- Clear quiz performance history
DELETE FROM quiz_performance_history;

-- Clear learning velocity metrics
DELETE FROM learning_velocity_metrics;

-- Reset any analytics tables that might reference deleted content
DELETE FROM help_content_analytics WHERE content_id LIKE 'note-%' OR content_id LIKE 'flashcard-%' OR content_id LIKE 'quiz-%';
