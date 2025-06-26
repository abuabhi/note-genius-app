
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useContentAnalysis } from './useContentAnalysis';
import { TopicSuggestionsResponse, TopicSuggestion } from '@/types/topicSuggestions';

export const useEnhancedTopicSuggestions = (subjectName?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getTopicSuggestions, analyzeContent } = useContentAnalysis();
  const [isGenerating, setIsGenerating] = useState(false);

  // Query for cached suggestions (existing functionality)
  const { data: cachedSuggestions, isLoading } = useQuery({
    queryKey: ['enhanced-topic-suggestions', user?.id, subjectName],
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

  // Enhanced suggestion generation with AI
  const generateEnhancedSuggestions = useCallback(async (subject: string) => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      console.log('🚀 Generating AI-enhanced topic suggestions for:', subject);

      // Get user's existing content for analysis
      const { data: userNotes } = await supabase
        .from('notes')
        .select('content, title, subject')
        .eq('user_id', user.id)
        .eq('subject', subject)
        .limit(20); // Analyze recent/relevant content

      const { data: userProgress } = await supabase
        .from('user_topic_progress')
        .select('topic_name, progress_type')
        .eq('user_id', user.id)
        .eq('subject_name', subject);

      const completedTopics = new Set(userProgress?.map(p => p.topic_name) || []);
      const userContent = userNotes?.map(note => `${note.title}\n${note.content}`) || [];

      // Get AI-powered topic recommendations
      const aiRecommendations = await getTopicSuggestions(userContent, subject);

      // Get curriculum topics for this subject
      const { data: curriculumTopics } = await supabase
        .from('curriculum_topics')
        .select('*')
        .eq('subject_name', subject)
        .order('difficulty_level');

      if (!curriculumTopics) return;

      // Combine AI recommendations with curriculum-based suggestions
      const suggestions: TopicSuggestion[] = [];
      
      // Priority 1: AI-recommended topics that exist in curriculum
      for (const aiTopic of aiRecommendations) {
        const curriculumMatch = curriculumTopics.find(
          topic => topic.topic_name.toLowerCase().includes(aiTopic.toLowerCase()) ||
                   aiTopic.toLowerCase().includes(topic.topic_name.toLowerCase())
        );

        if (curriculumMatch && !completedTopics.has(curriculumMatch.topic_name)) {
          suggestions.push({
            topic_name: curriculumMatch.topic_name,
            topic_description: curriculumMatch.topic_description,
            difficulty_level: curriculumMatch.difficulty_level,
            reason: 'ai_recommended',
            confidence_score: 0.95, // High confidence for AI recommendations
            suggested_resources: ['note', 'flashcard'] as ('note' | 'flashcard' | 'quiz')[],
            prerequisites_met: true,
            related_to: curriculumMatch.related_topics?.filter(rt => completedTopics.has(rt)) || []
          });
        }
      }

      // Priority 2: Traditional curriculum-based suggestions
      for (const topic of curriculumTopics) {
        if (completedTopics.has(topic.topic_name)) continue;
        if (suggestions.some(s => s.topic_name === topic.topic_name)) continue;

        // Check if prerequisites are met
        const prerequisitesMet = topic.prerequisites?.every(prereq => 
          completedTopics.has(prereq)
        ) ?? true;

        if (prerequisitesMet && suggestions.length < 8) {
          let reason = 'curriculum_sequence';
          let confidenceScore = 0.7;

          // Adjust confidence based on related topics
          if (topic.related_topics?.some(related => completedTopics.has(related))) {
            reason = 'related_topic';
            confidenceScore = 0.8;
          }

          if (topic.prerequisites?.some(prereq => completedTopics.has(prereq))) {
            reason = 'prerequisite_completed';
            confidenceScore = 0.85;
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

      // Sort by confidence score and AI priority
      suggestions.sort((a, b) => {
        if (a.reason === 'ai_recommended' && b.reason !== 'ai_recommended') return -1;
        if (b.reason === 'ai_recommended' && a.reason !== 'ai_recommended') return 1;
        return b.confidence_score - a.confidence_score;
      });

      const response: TopicSuggestionsResponse = {
        subject_name: subject,
        user_grade: 'Grade 10', // This could be dynamic based on user profile
        suggestions: suggestions.slice(0, 6), // Top 6 suggestions
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Cache the enhanced suggestions
      await supabase
        .from('topic_suggestions_cache')
        .upsert({
          user_id: user.id,
          subject_name: subject,
          suggestions: response as any,
          expires_at: response.expires_at
        });

      // Invalidate query to refresh UI
      queryClient.invalidateQueries({
        queryKey: ['enhanced-topic-suggestions', user.id, subject]
      });

      console.log('✅ AI-enhanced suggestions generated:', {
        totalSuggestions: suggestions.length,
        aiRecommended: suggestions.filter(s => s.reason === 'ai_recommended').length,
        traditionalSuggestions: suggestions.filter(s => s.reason !== 'ai_recommended').length
      });

      return response;

    } catch (error) {
      console.error('Error generating enhanced suggestions:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, getTopicSuggestions]);

  // Track progress with AI analysis
  const trackProgressWithAnalysis = useCallback(async (
    subject: string, 
    topic: string, 
    progressType: 'note' | 'flashcard' | 'quiz',
    content?: string
  ) => {
    if (!user?.id) return;

    try {
      // Track traditional progress
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

      // If content is provided, analyze it for better suggestions
      if (content) {
        await analyzeContent(content, progressType, subject);
      }

      // Invalidate cache to refresh suggestions
      queryClient.invalidateQueries({
        queryKey: ['enhanced-topic-suggestions', user.id, subject]
      });
    } catch (error) {
      console.error('Error tracking progress with analysis:', error);
      throw error;
    }
  }, [user?.id, analyzeContent, queryClient]);

  return {
    cachedSuggestions,
    generateEnhancedSuggestions,
    trackProgressWithAnalysis,
    isLoading,
    isGenerating
  };
};
