
import { useState, useEffect } from 'react';
import { GoalTemplate } from '@/types/study';

const defaultSuggestions: GoalTemplate[] = [
  {
    title: "Master Mathematics Fundamentals",
    description: "Build a strong foundation in core mathematical concepts",
    target_hours: 20,
    duration_days: 30,
    subject: "Mathematics"
  },
  {
    title: "Science Study Sprint",
    description: "Intensive review of key science topics",
    target_hours: 15,
    duration_days: 21,
    subject: "Science"
  },
  {
    title: "Language Arts Excellence",
    description: "Improve reading comprehension and writing skills",
    target_hours: 18,
    duration_days: 28,
    subject: "English"
  }
];

export const useGoalSuggestions = () => {
  const [suggestions] = useState<GoalTemplate[]>(defaultSuggestions);
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
