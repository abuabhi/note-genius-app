
-- Phase 1: Database Schema Updates
-- Rename category_id to subject_id in flashcard_sets table
ALTER TABLE public.flashcard_sets RENAME COLUMN category_id TO subject_id;

-- Rename category_id to subject_id in quizzes table  
ALTER TABLE public.quizzes RENAME COLUMN category_id TO subject_id;

-- Update study_goals table to use subject instead of category
ALTER TABLE public.study_goals RENAME COLUMN subject TO academic_subject;

-- Update todo_templates table to use subject instead of category
ALTER TABLE public.todo_templates RENAME COLUMN category TO subject;

-- Update quiz_performance_history table to use academic_subject instead of subject
ALTER TABLE public.quiz_performance_history RENAME COLUMN subject TO academic_subject;

-- Rename subject_categories table to academic_subjects for clarity
ALTER TABLE public.subject_categories RENAME TO academic_subjects;

-- Update foreign key references in sections table
ALTER TABLE public.sections RENAME COLUMN subject_id TO academic_subject_id;

-- Update any references to the old table name in existing data
UPDATE public.flashcard_sets SET subject_id = subject_id WHERE subject_id IS NOT NULL;
UPDATE public.quizzes SET subject_id = subject_id WHERE subject_id IS NOT NULL;
