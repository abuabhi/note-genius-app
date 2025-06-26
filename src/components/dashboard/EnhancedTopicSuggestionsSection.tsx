
import React from 'react';
import { EnhancedTopicSuggestionsWidget } from '@/components/suggestions/EnhancedTopicSuggestionsWidget';
import { useAuth } from '@/contexts/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, TrendingUp } from 'lucide-react';

export const EnhancedTopicSuggestionsSection: React.FC = () => {
  const { user } = useAuth();

  // Get user's most active subjects with AI analysis
  const { data: activeSubjects } = useQuery({
    queryKey: ['user-active-subjects-enhanced', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get subjects from multiple sources for better AI analysis
      const [notesData, progressData, flashcardsData] = await Promise.all([
        supabase
          .from('notes')
          .select('subject')
          .eq('user_id', user.id)
          .not('subject', 'is', null),
        
        supabase
          .from('user_topic_progress')
          .select('subject_name')
          .eq('user_id', user.id),
        
        supabase
          .from('flashcard_sets')
          .select('subject')
          .eq('user_id', user.id)
          .not('subject', 'is', null)
      ]);
      
      // Combine and count subjects
      const subjectCounts: Record<string, number> = {};
      
      notesData.data?.forEach(item => {
        if (item.subject) {
          subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
        }
      });
      
      progressData.data?.forEach(item => {
        subjectCounts[item.subject_name] = (subjectCounts[item.subject_name] || 0) + 1;
      });
      
      flashcardsData.data?.forEach(item => {
        if (item.subject) {
          subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
        }
      });
      
      // Sort by activity and return top subjects
      return Object.entries(subjectCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([subject]) => subject);
    },
    enabled: !!user?.id,
  });

  const subjectsToShow = activeSubjects?.length ? activeSubjects : ['Mathematics', 'Science'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">AI-Recommended Topics</h3>
        <TrendingUp className="h-4 w-4 text-mint-500" />
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Personalized suggestions powered by AI analysis of your learning patterns and content.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjectsToShow.slice(0, 2).map((subject) => (
          <EnhancedTopicSuggestionsWidget
            key={subject}
            subjectName={subject}
            maxSuggestions={3}
            className="h-fit"
          />
        ))}
      </div>
    </div>
  );
};
