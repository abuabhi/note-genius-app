
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useGoalTracking = () => {
  const { user } = useAuth();

  const calculateStudyHoursFromSessions = useCallback(async (goalId: string, goal: any) => {
    if (!user) return 0;

    try {
      let query = supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .not('duration', 'is', null)
        .gte('start_time', goal.start_date)
        .lte('start_time', goal.end_date + 'T23:59:59');

      // If goal has a specific subject, filter by it
      if (goal.subject) {
        query = query.eq('subject', goal.subject);
      }

      // If goal has a specific flashcard set, filter by it
      if (goal.flashcard_set_id) {
        query = query.eq('flashcard_set_id', goal.flashcard_set_id);
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error('Error fetching study sessions:', error);
        return 0;
      }

      const totalSeconds = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      return Math.round((totalSeconds / 3600) * 100) / 100; // Convert to hours with 2 decimal places
    } catch (error) {
      console.error('Error calculating study hours:', error);
      return 0;
    }
  }, [user]);

  const updateGoalProgressAutomatically = useCallback(async (goalId: string, studyHours: number, goal: any) => {
    if (!user) return;

    try {
      const newProgress = Math.min(100, Math.round((studyHours / goal.target_hours) * 100));
      const isCompleted = newProgress >= 100;
      const wasCompleted = goal.is_completed;
      const previousProgress = goal.progress;

      // Check for milestone achievements (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      const achievedMilestone = milestones.find(milestone => 
        newProgress >= milestone && previousProgress < milestone
      );

      const { error } = await supabase
        .from('study_goals')
        .update({ 
          progress: newProgress,
          is_completed: isCompleted 
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating goal progress:', error);
        return;
      }

      // Show milestone notifications
      if (achievedMilestone) {
        if (achievedMilestone === 100) {
          toast.success('🎉 Goal completed! Amazing work!');
        } else {
          toast.success(`🌟 ${achievedMilestone}% milestone reached! Keep it up!`);
        }
      }

      // Trigger achievement check for newly completed goals
      if (isCompleted && !wasCompleted) {
        await supabase.rpc('check_and_award_achievements', {
          p_user_id: user.id
        });
      }

    } catch (error) {
      console.error('Error updating goal progress automatically:', error);
    }
  }, [user]);

  const trackAllActiveGoals = useCallback(async () => {
    if (!user) return;

    try {
      const { data: activeGoals, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false);

      if (error || !activeGoals) {
        console.error('Error fetching active goals:', error);
        return;
      }

      for (const goal of activeGoals) {
        const studyHours = await calculateStudyHoursFromSessions(goal.id, goal);
        await updateGoalProgressAutomatically(goal.id, studyHours, goal);
      }
    } catch (error) {
      console.error('Error tracking goals:', error);
    }
  }, [user, calculateStudyHoursFromSessions, updateGoalProgressAutomatically]);

  // Set up real-time listener for study session updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('goal-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Debounce the tracking to avoid too frequent updates
          setTimeout(trackAllActiveGoals, 2000);
        }
      )
      .subscribe();

    // Initial tracking
    trackAllActiveGoals();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, trackAllActiveGoals]);

  return {
    trackAllActiveGoals,
    calculateStudyHoursFromSessions,
    updateGoalProgressAutomatically
  };
};
