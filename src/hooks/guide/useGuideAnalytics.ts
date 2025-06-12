
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Guide } from '@/types/guide';

export const useGuideAnalytics = () => {
  const { user } = useAuth();

  const startGuide = useCallback(async (guide: Guide) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: guide.id,
        event_type: 'view',
        context: 'guide',
        session_id: `guide_${Date.now()}`,
        metadata: {
          guide_title: guide.title,
          guide_category: guide.category,
          estimated_duration: guide.estimatedDuration,
          total_steps: guide.steps.length
        }
      });
    } catch (error) {
      console.error('Error tracking guide start:', error);
    }
  }, [user]);

  const stopGuide = useCallback(async (guide: Guide, currentStep: number) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: guide.id,
        event_type: 'interaction',
        context: 'guide',
        session_id: `guide_${Date.now()}`,
        metadata: {
          action: 'stop',
          step_reached: currentStep,
          completion_percentage: ((currentStep + 1) / guide.steps.length) * 100
        }
      });
    } catch (error) {
      console.error('Error tracking guide stop:', error);
    }
  }, [user]);

  const completeGuide = useCallback(async (guide: Guide) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: guide.id,
        event_type: 'interaction',
        context: 'guide',
        session_id: `guide_${Date.now()}`,
        metadata: {
          action: 'complete',
          guide_title: guide.title,
          total_steps: guide.steps.length
        }
      });
    } catch (error) {
      console.error('Error tracking guide completion:', error);
    }
  }, [user]);

  const skipGuide = useCallback(async (guide: Guide, currentStep: number) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: guide.id,
        event_type: 'interaction',
        context: 'guide',
        session_id: `guide_${Date.now()}`,
        metadata: {
          action: 'skip_guide',
          step_when_skipped: currentStep,
          completion_percentage: ((currentStep + 1) / guide.steps.length) * 100
        }
      });
    } catch (error) {
      console.error('Error tracking guide skip:', error);
    }
  }, [user]);

  const trackStepCompletion = useCallback(async (
    guide: Guide, 
    stepIndex: number, 
    action: 'next' | 'skip' | 'back'
  ) => {
    if (!user) return;

    try {
      await supabase.from('help_content_analytics').insert({
        user_id: user.id,
        content_id: guide.id,
        event_type: 'interaction',
        context: 'guide',
        session_id: `guide_${Date.now()}`,
        metadata: {
          action: `step_${action}`,
          step_index: stepIndex,
          step_id: guide.steps[stepIndex]?.id
        }
      });
    } catch (error) {
      console.error('Error tracking step completion:', error);
    }
  }, [user]);

  return {
    startGuide,
    stopGuide,
    completeGuide,
    skipGuide,
    trackStepCompletion
  };
};
