
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { TopicSuggestionsResponse, TopicSuggestion } from '@/types/topicSuggestions';

export const useTopicSuggestions = (subjectName?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Query for cached suggestions
  const { data: cachedSuggestions, isLoading } = useQuery({
    queryKey: ['topic-suggestions', user?.id, subjectName],
    queryFn: async () => {
      if (!user?.id || !subjectName) return null;
      
      const { data, error } = await supabase
        .from('topic_suggestions_cache')
        .select('suggestions')
        .eq('user_id', user.id)
        .eq('subject_name', subjectName)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      
      if (data?.suggestions) {
        return data.suggestions as unknown as TopicSuggestionsResponse;
      }
      
      return null;
    },
    enabled: !!user?.id && !!subjectName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to save suggestions to cache
  const saveSuggestionsMutation = useMutation({
    mutationFn: async (suggestions: TopicSuggestionsResponse) => {
      if (!user?.id || !subjectName) throw new Error('Missing user or subject');

      const { error } = await supabase
        .from('topic_suggestions_cache')
        .upsert({
          user_id: user.id,
          subject_name: subjectName,
          suggestions: suggestions as any, // Cast to Json type
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;
      return suggestions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['topic-suggestions', user?.id, subjectName]
      });
    }
  });

  // Generate suggestions based on curriculum and user progress
  const getSuggestions = useCallback(async (subject: string) => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      // Get user's completed topics for this subject
      const { data: userProgress } = await supabase
        .from('user_topic_progress')
        .select('topic_name, progress_type')
        .eq('user_id', user.id)
        .eq('subject_name', subject);

      const completedTopics = new Set(userProgress?.map(p => p.topic_name) || []);

      // Get curriculum topics for this subject
      const { data: curriculumTopics } = await supabase
        .from('curriculum_topics')
        .select('*')
        .eq('subject_name', subject)
        .order('difficulty_level');

      if (!curriculumTopics) return;

      // Generate suggestions based on prerequisites and difficulty
      const suggestions: TopicSuggestion[] = [];
      
      for (const topic of curriculumTopics) {
        if (completedTopics.has(topic.topic_name)) continue;

        // Check if prerequisites are met
        const prerequisitesMet = topic.prerequisites?.every(prereq => 
          completedTopics.has(prereq)
        ) ?? true;

        if (prerequisitesMet && suggestions.length < 5) {
          let reason = 'curriculum_sequence';
          let confidenceScore = 0.7;

          // Adjust confidence based on related topics
          if (topic.related_topics?.some(related => completedTopics.has(related))) {
            reason = 'related_topic';
            confidenceScore = 0.8;
          }

          if (topic.prerequisites?.some(prereq => completedTopics.has(prereq))) {
            reason = 'prerequisite_completed';
            confidenceScore = 0.9;
          }

          suggestions.push({
            topic_name: topic.topic_name,
            topic_description: topic.topic_description,
            difficulty_level: topic.difficulty_level,
            reason,
            confidence_score: confidenceScore,
            suggested_resources: ['note', 'flashcard'] as ('note' | 'flashcard' | 'quiz')[],
            prerequisites_met: prerequisitesMet,
            related_to: topic.related_topics?.filter(rt => completedTopics.has(rt)) || []
          });
        }
      }

      const response: TopicSuggestionsResponse = {
        subject_name: subject,
        user_grade: 'Grade 10', // This could be dynamic based on user profile
        suggestions,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      await saveSuggestionsMutation.mutateAsync(response);
      return response;

    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, saveSuggestionsMutation]);

  // Track user progress
  const trackProgress = useCallback(async (subject: string, topic: string, progressType: 'note' | 'flashcard' | 'quiz') => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_topic_progress')
        .upsert({
          user_id: user.id,
          subject_name: subject,
          topic_name: topic,
          progress_type: progressType,
          resource_count: 1,
          last_activity_at: new Date().toISOString()
        });

      // Invalidate cache to refresh suggestions
      queryClient.invalidateQueries({
        queryKey: ['topic-suggestions', user.id, subject]
      });
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }, [user?.id, queryClient]);

  return {
    cachedSuggestions,
    getSuggestions,
    trackProgress,
    isLoading,
    isGenerating
  };
};
