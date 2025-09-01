import { useMemo } from 'react';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { PREDEFINED_SUBJECTS } from '@/types/subject';

export interface SubjectOption {
  value: string;
  label: string;
}

export const useFlashcardSubjects = () => {
  const { subjects: userSubjects, isLoading } = useUserSubjects();

  const subjectOptions: SubjectOption[] = useMemo(() => {
    const options: SubjectOption[] = [
      { value: 'all', label: 'All Subjects' }
    ];

    // Add predefined subjects
    PREDEFINED_SUBJECTS.forEach(subject => {
      options.push({
        value: subject.toLowerCase().replace(/\s+/g, '_'),
        label: subject
      });
    });

    // Add user subjects, avoiding duplicates
    if (userSubjects) {
      userSubjects.forEach(userSubject => {
        const normalizedName = userSubject.name.toLowerCase().replace(/\s+/g, '_');
        const exists = options.some(option => 
          option.value === normalizedName || 
          option.label.toLowerCase() === userSubject.name.toLowerCase()
        );
        
        if (!exists) {
          options.push({
            value: normalizedName,
            label: userSubject.name
          });
        }
      });
    }

    return options;
  }, [userSubjects]);

  const allSubjects = useMemo(() => {
    const subjects: string[] = [...PREDEFINED_SUBJECTS];
    
    if (userSubjects) {
      userSubjects.forEach(userSubject => {
        const exists = subjects.some(subject => 
          subject.toLowerCase() === userSubject.name.toLowerCase()
        );
        
        if (!exists) {
          subjects.push(userSubject.name);
        }
      });
    }

    return subjects;
  }, [userSubjects]);

  return {
    subjectOptions,
    allSubjects,
    isLoading
  };
};