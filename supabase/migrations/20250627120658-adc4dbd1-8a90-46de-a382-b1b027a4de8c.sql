
-- Phase 1: Database Optimization - Add critical indexes for reminder queries
-- These indexes will dramatically improve query performance for concurrent users

-- Index for user-specific reminder queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_reminders_user_status_time 
ON reminders (user_id, status, reminder_time);

-- Index for user-specific reminders ordered by time
CREATE INDEX IF NOT EXISTS idx_reminders_user_time_desc 
ON reminders (user_id, reminder_time DESC);

-- Index for user-specific todo queries
CREATE INDEX IF NOT EXISTS idx_reminders_user_type_status 
ON reminders (user_id, type, status);

-- Index for due date queries (todos)
CREATE INDEX IF NOT EXISTS idx_reminders_user_due_date 
ON reminders (user_id, due_date) WHERE due_date IS NOT NULL;

-- Partial index for pending reminders only (most queries filter by status)
CREATE INDEX IF NOT EXISTS idx_reminders_pending_user_time 
ON reminders (user_id, reminder_time) WHERE status = 'pending';

-- Partial index for active reminders
CREATE INDEX IF NOT EXISTS idx_reminders_active_user 
ON reminders (user_id, updated_at DESC) WHERE status IN ('pending', 'sent');

-- Update table statistics for better query planning
ANALYZE reminders;
