DO $$
DECLARE
  uid uuid := '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
  user_id_tables text[] := ARRAY[
    'admin_rate_limiting','blog_campaigns','content_analysis_cache','contest_entries',
    'conversation_participants','coupon_usage','digest_content_cache','email_digest_preferences',
    'events','exam_topic_links','exam_topics','exams','feedback','flashcard_sets','flashcards',
    'help_content_analytics','help_search_analytics','help_session_analytics',
    'influencer_promotions_audit','learning_insights','learning_patterns','learning_progress',
    'learning_velocity_metrics','mock_subscriptions','note_chat_messages','note_content_expansions',
    'note_enrichment_usage','notes','plan_templates','predictive_analytics_cache',
    'quiz_attempts_draft','quiz_performance_history','quiz_results','quiz_sessions','quizzes',
    'reminders','resources','security_audit_log','security_monitoring',
    'simple_flashcard_progress','study_achievements','study_analytics','study_goals',
    'study_group_members','study_plans','study_sessions','subscribers','test_sessions',
    'tier_change_history','todo_templates','topic_suggestions_cache','user_academic_preferences',
    'user_activity_feed','user_dismissed_announcements','user_flashcard_progress',
    'user_selected_music_track','user_sessions_security','user_subjects','user_topic_progress',
    'video_analytics'
  ];
  t text;
BEGIN
  -- Delete from all tables that have a user_id column
  FOREACH t IN ARRAY user_id_tables LOOP
    EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', t) USING uid;
  END LOOP;

  -- Delete from tables with other ownership columns
  DELETE FROM public.admin_todos        WHERE created_by = uid;
  DELETE FROM public.announcements      WHERE created_by = uid;
  DELETE FROM public.help_topics        WHERE created_by = uid;
  DELETE FROM public.study_group_resources WHERE created_by = uid;
  DELETE FROM public.study_music_tracks WHERE created_by = uid;
  DELETE FROM public.blog_posts         WHERE author_id  = uid;

  DELETE FROM public.coupon_usage       WHERE influencer_id = uid;
  DELETE FROM public.influencer_coupons WHERE influencer_id = uid;
  DELETE FROM public.influencer_orders  WHERE influencer_id = uid;
  DELETE FROM public.influencer_payouts WHERE influencer_id = uid;

  DELETE FROM public.referrals WHERE referrer_id = uid OR referred_user_id = uid;

  -- Profile last (so any FKs from above with cascade are clear)
  DELETE FROM public.profiles WHERE id = uid;

  -- Finally remove the auth user
  DELETE FROM auth.users WHERE id = uid;
END $$;