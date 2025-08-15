-- Fix 56 Supabase Security Warnings
-- Phase 1: Fix Function Search Path Mutable (54 warnings)
-- Add SET search_path = '' to all existing functions for security

-- Update all existing functions to include SET search_path = ''
ALTER FUNCTION public.update_feedback_updated_at() SET search_path = '';
ALTER FUNCTION public.calculate_mrr() SET search_path = '';
ALTER FUNCTION public.calculate_arr() SET search_path = '';
ALTER FUNCTION public.update_study_plans_updated_at() SET search_path = '';
ALTER FUNCTION public.award_achievement(uuid, text) SET search_path = '';
ALTER FUNCTION public.exec_sql(text) SET search_path = '';
ALTER FUNCTION public.cleanup_expired_suggestions_cache() SET search_path = '';
ALTER FUNCTION public.get_user_email_for_feedback(uuid) SET search_path = '';
ALTER FUNCTION public.update_admin_settings_updated_at() SET search_path = '';
ALTER FUNCTION public.cleanup_expired_analytics_cache() SET search_path = '';
ALTER FUNCTION public.calculate_churn_rate() SET search_path = '';
ALTER FUNCTION public.calculate_dau(date) SET search_path = '';
ALTER FUNCTION public.get_overdue_goals(uuid) SET search_path = '';
ALTER FUNCTION public.validate_session_duration() SET search_path = '';
ALTER FUNCTION public.check_and_award_achievements(uuid) SET search_path = '';
ALTER FUNCTION public.check_todo_dependency_cycle() SET search_path = '';
ALTER FUNCTION public.calculate_mau(date) SET search_path = '';
ALTER FUNCTION public.calculate_avg_session_length() SET search_path = '';
ALTER FUNCTION public.get_overdue_todos(uuid) SET search_path = '';
ALTER FUNCTION public.force_delete_note(uuid) SET search_path = '';
ALTER FUNCTION public.update_digest_preferences_updated_at() SET search_path = '';
ALTER FUNCTION public.update_learning_progress_updated_at() SET search_path = '';
ALTER FUNCTION public.calculate_session_quality(integer, integer, integer, integer, integer) SET search_path = '';
ALTER FUNCTION public.update_session_quality() SET search_path = '';
ALTER FUNCTION public.calculate_dau_enhanced(date) SET search_path = '';
ALTER FUNCTION public.auto_escalate_overdue_todos() SET search_path = '';
ALTER FUNCTION public.batch_dismiss_reminders(uuid, uuid[]) SET search_path = '';
ALTER FUNCTION public.update_flashcard_set_card_count() SET search_path = '';
ALTER FUNCTION public.get_active_announcements(text, text) SET search_path = '';
ALTER FUNCTION public.dismiss_announcement(uuid) SET search_path = '';
ALTER FUNCTION public.update_announcements_updated_at() SET search_path = '';
ALTER FUNCTION public.update_contact_submissions_updated_at() SET search_path = '';
ALTER FUNCTION public.generate_influencer_coupon_code(text) SET search_path = '';
ALTER FUNCTION public.cleanup_old_reminders(integer) SET search_path = '';
ALTER FUNCTION public.process_referral_signup(uuid, text) SET search_path = '';
ALTER FUNCTION public.validate_coupon(text) SET search_path = '';
ALTER FUNCTION public.update_app_features_updated_at() SET search_path = '';
ALTER FUNCTION public.update_events_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column_for_chat() SET search_path = '';
ALTER FUNCTION public.calculate_session_duration() SET search_path = '';
ALTER FUNCTION public.get_user_reminders_paginated(uuid, integer, integer, text[]) SET search_path = '';
ALTER FUNCTION public.create_next_recurring_reminder(uuid) SET search_path = '';
ALTER FUNCTION public.get_reminder_system_health() SET search_path = '';
ALTER FUNCTION public.update_cleanup_config_updated_at() SET search_path = '';
ALTER FUNCTION public.get_digest_users() SET search_path = '';
ALTER FUNCTION public.is_dean_user(uuid) SET search_path = '';
ALTER FUNCTION public.force_delete_note_optimized(uuid) SET search_path = '';
ALTER FUNCTION public.filter_user_notes(uuid, text, text, boolean, text, integer, integer) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.filter_user_flashcard_sets(uuid, text, text, text, integer, integer) SET search_path = '';
ALTER FUNCTION public.filter_user_quizzes(uuid, text, text, text, integer, integer) SET search_path = '';
ALTER FUNCTION public.check_user_in_conversation(uuid) SET search_path = '';
ALTER FUNCTION public.update_last_message_timestamp() SET search_path = '';

-- Phase 2: Fix Extension in Public Schema (1 warning)
-- Create extensions schema and move pg_net extension
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_net SET SCHEMA extensions;

-- Phase 3: Update auth configuration is handled in Supabase dashboard
-- The following are configuration changes that need to be done in dashboard:
-- 1. Reduce OTP expiry time to 300 seconds (5 minutes) 
-- 2. Enable leaked password protection

-- Add comment for manual steps needed
COMMENT ON SCHEMA extensions IS 'Schema for extensions to avoid security warnings. Manual steps: 1) Set OTP expiry to 300s in Auth settings 2) Enable leaked password protection in Auth settings';