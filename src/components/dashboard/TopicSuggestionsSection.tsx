
import React from 'react';
import { TopicSuggestionsWidget } from '@/components/suggestions/TopicSuggestionsWidget';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const TopicSuggestionsSection: React.FC = () => {
  const { user } = useAuth();

  // Get user's most active subjects
  const { data: activeSubjects } = useQuery({
    queryKey: ['user-active-subjects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_topic_progress')
        .select('subject_name')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Get unique subjects and count occurrences
      const subjectCounts = data?.reduce((acc, item) => {
        acc[item.subject_name] = (acc[item.subject_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      // Sort by count and return top subjects
      return Object.entries(subjectCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([subject]) => subject);
    },
    enabled: !!user?.id,
  });

  const subjectsToShow = activeSubjects?.length ? activeSubjects : ['Mathematics'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recommended Topics</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjectsToShow.slice(0, 2).map((subject) => (
          <TopicSuggestionsWidget
            key={subject}
            subjectName={subject}
            maxSuggestions={2}
            className="h-fit"
          />
        ))}
      </div>
    </div>
  );
};
