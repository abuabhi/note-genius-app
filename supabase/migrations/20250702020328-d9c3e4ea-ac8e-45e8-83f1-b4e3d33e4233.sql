
-- Clean up all existing reminders to start fresh and eliminate data inconsistencies
DELETE FROM public.reminders;

-- Reset any related sequences if needed
-- This ensures we start with a clean slate for the reminder system
