
import { useState, useEffect, useMemo } from 'react';
import { GoalTemplate } from '@/types/study';
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const useGoalSuggestions = () => {
  const { subjects: userSubjects } = useUserSubjects();
  
  // Generate dynamic goal suggestions based on user's subjects
  const suggestions = useMemo((): GoalTemplate[] => {
    if (!userSubjects?.length) {
      return [
        {
          title: "Set Up Your Study Goals",
          description: "Create your first study goal to track progress and stay motivated",
          target_hours: 10,
          duration_days: 14,
          subject: "General"
        }
      ];
    }

    // Create goal suggestions for each user subject
    return userSubjects.slice(0, 3).map((subject, index) => {
      const goalTemplates = [
        {
          title: `Master ${subject.name} Fundamentals`,
          description: `Build a strong foundation in core ${subject.name.toLowerCase()} concepts`,
          target_hours: 20,
          duration_days: 30
        },
        {
          title: `${subject.name} Study Sprint`,
          description: `Intensive review of key ${subject.name.toLowerCase()} topics`,
          target_hours: 15,
          duration_days: 21
        },
        {
          title: `${subject.name} Excellence`,
          description: `Improve understanding and performance in ${subject.name.toLowerCase()}`,
          target_hours: 18,
          duration_days: 28
        }
      ];

      const template = goalTemplates[index % goalTemplates.length];
      return {
        ...template,
        subject: subject.name
      };
    });
  }, [userSubjects]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedGoalSuggestions');
    if (dismissed) {
      setDismissedSuggestions(JSON.parse(dismissed));
    }
  }, []);

  const toggleSuggestions = () => {
    setSuggestionsEnabled(prev => !prev);
  };

  const refreshSuggestions = () => {
    setDismissedSuggestions([]);
    localStorage.removeItem('dismissedGoalSuggestions');
  };

  return {
    suggestions,
    dismissedSuggestions,
    setDismissedSuggestions,
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions
  };
};
