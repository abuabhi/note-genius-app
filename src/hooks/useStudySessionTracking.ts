
import { useDisabledSessionSystems } from '@/hooks/useDisabledSessionSystems';

export const useStudySessionTracking = () => {
  // Redirect to disabled system to prevent conflicts with unified tracker
  return useDisabledSessionSystems();
};
