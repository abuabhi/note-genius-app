
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { TopicSuggestionsResponse, CurriculumTopic, UserTopicProgress } from '@/types/topicSuggestions';
import { toast } from 'sonner';

export const useTopicSuggestions = (subjectName?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's topic progress
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-topic-progress', user?.id, subjectName],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('user_topic_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (subjectName) {
        query = query.eq('subject_name', subjectName);
      }
      
      const { data, error } = await query.order('last_activity_at', { ascending: false });
      
      if (error) throw error;
      return data as UserTopicProgress[];
    },
    enabled: !!user?.id,
  });

  // Fetch curriculum topics
  const { data: curriculumTopics, isLoading: curriculumLoading } = useQuery({
    queryKey: ['curriculum-topics', subjectName],
    queryFn: async () => {
      let query = supabase
        .from('curriculum_topics')
        .select('*');
      
      if (subjectName) {
        query = query.eq('subject_name', subjectName);
      }
      
      const { data, error } = await query.order('difficulty_level', { ascending: true });
      
      if (error) throw error;
      return data as CurriculumTopic[];
    },
  });

  // Fetch cached suggestions
  const { data: cachedSuggestions, isLoading: cacheLoading } = useQuery({
    queryKey: ['topic-suggestions-cache', user?.id, subjectName],
    queryFn: async () => {
      if (!user?.id || !subjectName) return null;
      
      const { data, error } = await supabase
        .from('topic_suggestions_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_name', subjectName)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !!subjectName,
  });

  // Generate suggestions mutation
  const generateSuggestionsMutation = useMutation({
    mutationFn: async ({ subject, forceRefresh = false }: { subject: string; forceRefresh?: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check cache first unless force refresh
      if (!forceRefresh && cachedSuggestions?.suggestions) {
        return cachedSuggestions.suggestions as TopicSuggestionsResponse;
      }

      const suggestions = await generateTopicSuggestions(
        subject,
        userProgress || [],
        curriculumTopics || [],
        user.id
      );

      // Cache the suggestions
      await supabase
        .from('topic_suggestions_cache')
        .upsert({
          user_id: user.id,
          subject_name: subject,
          suggestions: suggestions,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

      return suggestions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-suggestions-cache'] });
      toast.success('Topic suggestions updated!');
    },
    onError: (error) => {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate topic suggestions');
    },
  });

  // Track user progress mutation
  const trackProgressMutation = useMutation({
    mutationFn: async ({ 
      subject, 
      topic, 
      progressType 
    }: { 
      subject: string; 
      topic: string; 
      progressType: 'note' | 'flashcard' | 'quiz';
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_topic_progress')
        .upsert({
          user_id: user.id,
          subject_name: subject,
          topic_name: topic,
          progress_type: progressType,
          resource_count: 1,
          last_activity_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,subject_name,topic_name,progress_type',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-topic-progress'] });
      queryClient.invalidateQueries({ queryKey: ['topic-suggestions-cache'] });
    },
  });

  const getSuggestions = useCallback((subject?: string) => {
    if (!subject && !subjectName) return null;
    
    const targetSubject = subject || subjectName!;
    return generateSuggestionsMutation.mutateAsync({ subject: targetSubject });
  }, [subjectName, generateSuggestionsMutation]);

  const trackProgress = useCallback((
    subject: string, 
    topic: string, 
    progressType: 'note' | 'flashcard' | 'quiz'
  ) => {
    return trackProgressMutation.mutateAsync({ subject, topic, progressType });
  }, [trackProgressMutation]);

  return {
    userProgress,
    curriculumTopics,
    cachedSuggestions: cachedSuggestions?.suggestions as TopicSuggestionsResponse | null,
    isLoading: progressLoading || curriculumLoading || cacheLoading,
    getSuggestions,
    trackProgress,
    isGenerating: generateSuggestionsMutation.isPending,
    isTracking: trackProgressMutation.isPending,
  };
};

// Helper function to generate topic suggestions
async function generateTopicSuggestions(
  subjectName: string,
  userProgress: UserTopicProgress[],
  curriculumTopics: CurriculumTopic[],
  userId: string
): Promise<TopicSuggestionsResponse> {
  // Get user's grade from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('grade')
    .eq('id', userId)
    .single();

  const userGrade = profile?.grade || 'Grade 10';
  
  // Filter topics for the user's grade and subject
  const relevantTopics = curriculumTopics.filter(
    topic => topic.grade_level === userGrade && topic.subject_name === subjectName
  );
  
  // Get topics user has already worked on
  const completedTopics = new Set(
    userProgress
      .filter(p => p.subject_name === subjectName)
      .map(p => p.topic_name)
  );
  
  // Generate suggestions based on different strategies
  const suggestions = relevantTopics
    .filter(topic => !completedTopics.has(topic.topic_name))
    .map(topic => {
      let reason = '';
      let confidenceScore = 0.5;
      let suggestedResources: ('note' | 'flashcard' | 'quiz')[] = ['note'];
      let relatedTo: string[] = [];
      
      // Strategy 1: Prerequisites completed
      const prerequisitesMet = topic.prerequisites.every(prereq => 
        completedTopics.has(prereq) || 
        relevantTopics.some(t => t.topic_name === prereq && t.difficulty_level <= topic.difficulty_level - 1)
      );
      
      if (prerequisitesMet && topic.prerequisites.length > 0) {
        reason = 'prerequisite_completed';
        confidenceScore += 0.3;
        relatedTo = topic.prerequisites.filter(p => completedTopics.has(p));
      }
      
      // Strategy 2: Related topics
      const hasRelatedCompleted = topic.related_topics.some(related => completedTopics.has(related));
      if (hasRelatedCompleted) {
        reason = reason || 'related_topic';
        confidenceScore += 0.2;
        relatedTo = [...relatedTo, ...topic.related_topics.filter(r => completedTopics.has(r))];
      }
      
      // Strategy 3: Difficulty progression
      const userMaxDifficulty = Math.max(
        ...userProgress
          .filter(p => p.subject_name === subjectName)
          .map(p => {
            const currTopic = relevantTopics.find(t => t.topic_name === p.topic_name);
            return currTopic?.difficulty_level || 1;
          }),
        0
      );
      
      if (topic.difficulty_level <= userMaxDifficulty + 1) {
        reason = reason || 'difficulty_progression';
        confidenceScore += 0.15;
      }
      
      // Strategy 4: Curriculum sequence (basic fallback)
      if (!reason) {
        reason = 'curriculum_sequence';
        confidenceScore = 0.3;
      }
      
      // Suggest different resource types based on topic and user history
      const userResourceTypes = new Set(
        userProgress
          .filter(p => p.subject_name === subjectName)
          .map(p => p.progress_type)
      );
      
      if (userResourceTypes.has('note')) suggestedResources.push('flashcard');
      if (userResourceTypes.has('flashcard')) suggestedResources.push('quiz');
      if (!userResourceTypes.has('note')) suggestedResources = ['note', 'flashcard'];
      
      return {
        topic_name: topic.topic_name,
        topic_description: topic.topic_description,
        difficulty_level: topic.difficulty_level,
        reason,
        confidence_score: Math.min(confidenceScore, 1.0),
        suggested_resources: [...new Set(suggestedResources)],
        prerequisites_met: prerequisitesMet,
        related_to: [...new Set(relatedTo)],
      };
    })
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 8); // Limit to top 8 suggestions
  
  return {
    subject_name: subjectName,
    user_grade: userGrade,
    suggestions,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
