
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { StudyPlan } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useStudyPlanSession = () => {
  const { startSession, endSession, isActive, currentSessionId, activityType } = useUnifiedSessionTracker();
  const { studyPlans } = useActiveStudyPlans();

  const startStudyPlanSession = async (studyPlan: StudyPlan) => {
    try {
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

      // Start new study plan session
      await startSession({
        title: `Study Session: ${studyPlan.title}`,
        subject: studyPlan.subject,
        activityType: 'study_plan',
        studyPlanId: studyPlan.id
      });

      toast.success(`Study session started for ${studyPlan.title}`);
      return true;
    } catch (error) {
      console.error('Error starting study plan session:', error);
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
    // Extract study plan ID from current session if it's a study plan session
    if (isActive && activityType === 'study_plan') {
      // This would need to be stored in the session metadata
      return currentSessionId;
    }
    return null;
  };

  const isStudyPlanActive = (planId: string) => {
    return isActive && activityType === 'study_plan' && getActiveStudyPlanId() === planId;
  };

  return {
    startStudyPlanSession,
    endStudyPlanSession,
    isStudyPlanActive,
    getActiveStudyPlanId,
    isAnySessionActive: isActive
  };
};
