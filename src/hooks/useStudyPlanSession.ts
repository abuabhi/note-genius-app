
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { StudyPlan } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useStudyPlanSession = () => {
  const { 
    startSession, 
    endSession, 
    isActive, 
    currentSessionId, 
    activityType, 
    currentTitle, 
    studyPlanId,
    isRecovering 
  } = useUnifiedSessionTracker();
  
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

      // Start new study plan session with proper association
      const sessionId = await startSession({
        title: `Study Plan: ${studyPlan.title}`,
        subject: studyPlan.subject,
        activityType: 'study_plan',
        studyPlanId: studyPlan.id
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

  const isStudyPlanActive = (planId: string) => {
    // Don't show as active during recovery to prevent UI flickering
    if (isRecovering) return false;
    
    return isActive && activityType === 'study_plan' && studyPlanId === planId;
  };

  const getActiveStudyPlanId = () => {
    return isActive && activityType === 'study_plan' ? studyPlanId : null;
  };

  return {
    startStudyPlanSession,
    endStudyPlanSession,
    isStudyPlanActive,
    getActiveStudyPlanId,
    isAnySessionActive: isActive,
    isRecovering
  };
};
