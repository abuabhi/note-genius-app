-- Add manual study time tracking fields to study_sessions table
ALTER TABLE public.study_sessions 
ADD COLUMN session_source text NOT NULL DEFAULT 'online',
ADD COLUMN manual_entry_date date,
ADD COLUMN manual_entry_notes text,
ADD COLUMN manual_verified boolean DEFAULT true;

-- Add check constraint for session_source
ALTER TABLE public.study_sessions 
ADD CONSTRAINT valid_session_source 
CHECK (session_source IN ('online', 'offline'));

-- Add index for better performance on session_source queries
CREATE INDEX idx_study_sessions_session_source ON public.study_sessions(session_source);

-- Add index for manual entry queries
CREATE INDEX idx_study_sessions_manual_entry_date ON public.study_sessions(manual_entry_date) 
WHERE session_source = 'offline';

-- Update existing sessions to have 'online' source
UPDATE public.study_sessions 
SET session_source = 'online' 
WHERE session_source IS NULL;