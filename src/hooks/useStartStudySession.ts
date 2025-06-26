
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';

export const useStartStudySession = () => {
  const queryClient = useQueryClient();
  const { startStudyPlanSession } = useStudyPlanSession();

  const mutation = useMutation({
    mutationFn: async (studyPlan: StudyPlan): Promise<string> => {
      const success = await startStudyPlanSession(studyPlan);
      if (!success) {
        throw new Error('Failed to start session');
      }
      return 'session-started'; // Return a success indicator
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
    },
    onError: (error) => {
      console.error('Error in useStartStudySession:', error);
    }
  });

  return {
    startSession: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
