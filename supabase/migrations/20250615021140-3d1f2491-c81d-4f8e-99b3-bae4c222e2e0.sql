
-- Critical database indexes for scalability and performance optimization
-- Note: Removed CONCURRENTLY to avoid transaction block issues

-- Notes table optimization (user-specific queries)
CREATE INDEX IF NOT EXISTS idx_notes_user_id_updated_at 
ON notes (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_user_id_created_at 
ON notes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_user_id_archived 
ON notes (user_id, archived);

CREATE INDEX IF NOT EXISTS idx_notes_user_id_subject 
ON notes (user_id, subject);

CREATE INDEX IF NOT EXISTS idx_notes_user_id_pinned 
ON notes (user_id, pinned DESC, updated_at DESC);

-- Full-text search optimization for notes
CREATE INDEX IF NOT EXISTS idx_notes_title_search 
ON notes USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_notes_content_search 
ON notes USING gin(to_tsvector('english', content));

-- Study sessions optimization
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id_start_time 
ON study_sessions (user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id_active 
ON study_sessions (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id_activity_type 
ON study_sessions (user_id, activity_type, start_time DESC);

-- Flashcard progress optimization
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id_reviewed 
ON user_flashcard_progress (user_id, last_reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id_mastery 
ON user_flashcard_progress (user_id, mastery_level);

-- Flashcard sets optimization
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_id_updated 
ON flashcard_sets (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_id_subject 
ON flashcard_sets (user_id, subject);

-- User subjects optimization
CREATE INDEX IF NOT EXISTS idx_user_subjects_user_id_name 
ON user_subjects (user_id, name);

-- Learning progress optimization
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id_flashcard 
ON learning_progress (user_id, flashcard_id);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id_last_seen 
ON learning_progress (user_id, last_seen_at DESC);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_performance_monitoring 
ON study_sessions (start_time, duration, cards_reviewed) 
WHERE end_time IS NOT NULL;

-- Add table statistics update for better query planning
ANALYZE notes;
ANALYZE study_sessions;
ANALYZE user_flashcard_progress;
ANALYZE flashcard_sets;
ANALYZE learning_progress;
