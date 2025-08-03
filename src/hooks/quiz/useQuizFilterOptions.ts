
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const useQuizFilterOptions = () => {
  // Use the consolidated user subjects hook for consistency
  const { subjects, isLoading, error } = useUserSubjects();
  
  // Transform to match expected format
  const transformedSubjects = subjects.map(subject => ({
    id: subject.id,
    name: subject.name
  }));

  return {
    data: { subjects: transformedSubjects },
    isLoading,
    error,
    refetch: () => {}, // The useUserSubjects hook handles its own refetching
  };
};
