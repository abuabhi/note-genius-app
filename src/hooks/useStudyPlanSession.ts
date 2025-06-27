
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { StudyPlan } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useStudyPlanSession = () => {
  const { startSession, endSession, isActive, currentSessionId, activityType, currentTitle } = useUnifiedSessionTracker();
  const { studyPlans } = useActiveStudyPlans();

  const startStudyPlanSession = async (studyPlan: StudyPlan) => {
    try {
      console.log('🎯 Starting study plan session for:', studyPlan.title);
      
      // Check if there's already an active session
      if (isActive) {
        const confirmEnd = window.confirm(
          'You have an active session running. Do you want to end it and start a new study session?'
        );
        
        if (!confirmEnd) {
          return false;
        }
        
        // End current session first
        await endSession('Starting new study plan session');
      }

      // Start new study plan session - don't pass studyPlanId to avoid foreign key constraint
      const sessionId = await startSession({
        title: `Study Plan: ${studyPlan.title}`,
        subject: studyPlan.subject,
        activityType: 'study_plan'
        // Remove studyPlanId to avoid foreign key constraint error
      });

      console.log('🎯 Study plan session started successfully:', sessionId);
      toast.success(`Study session started for ${studyPlan.title}`);
      return true;
    } catch (error) {
      console.error('❌ Error starting study plan session:', error);
      toast.error('Failed to start study session');
      return false;
    }
  };

  const endStudyPlanSession = async (reason = 'Manual session end') => {
    try {
      await endSession(reason);
      toast.success('Study session ended');
      return true;
    } catch (error) {
      console.error('Error ending study plan session:', error);
      toast.error('Failed to end study session');
      return false;
    }
  };

  const getActiveStudyPlanId = () => {
    // Check if current session is for a study plan and extract the ID from the title
    if (isActive && activityType === 'study_plan' && currentTitle) {
      // Try to find matching study plan by checking if session title contains the plan title
      const matchingPlan = studyPlans.find(plan => 
        currentTitle.includes(plan.title) || currentTitle.includes(`Study Plan: ${plan.title}`)
      );
      return matchingPlan?.id || null;
    }
    return null;
  };

  const isStudyPlanActive = (planId: string) => {
    const activeStudyPlanId = getActiveStudyPlanId();
    return isActive && activityType === 'study_plan' && activeStudyPlanId === planId;
  };

  return {
    startStudyPlanSession,
    endStudyPlanSession,
    isStudyPlanActive,
    getActiveStudyPlanId,
    isAnySessionActive: isActive
  };
};
