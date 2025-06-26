
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface TopicDetection {
  topic: string;
  confidence: number;
  difficulty_level: number;
  learning_objectives: string[];
  related_concepts: string[];
}

export interface ContentAnalysisResult {
  detected_topics: TopicDetection[];
  content_quality_score: number;
  suggested_improvements: string[];
  recommended_next_topics: string[];
  learning_style_insights: {
    visual_elements: number;
    conceptual_depth: number;
    practical_examples: number;
  };
}

export const useContentAnalysis = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<Map<string, ContentAnalysisResult>>(new Map());

  const analyzeContent = useCallback(async (
    content: string,
    contentType: 'note' | 'flashcard' | 'quiz',
    subject?: string
  ): Promise<ContentAnalysisResult | null> => {
    if (!user?.id || !content.trim()) return null;

    // Create cache key
    const cacheKey = `${contentType}-${subject || 'general'}-${content.substring(0, 100)}`;
    
    // Check cache first
    if (analysisCache.has(cacheKey)) {
      console.log('🎯 Content analysis cache hit:', cacheKey);
      return analysisCache.get(cacheKey)!;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔍 Starting AI content analysis:', {
        contentType,
        subject,
        contentLength: content.length
      });

      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: {
          content,
          contentType,
          subject,
          userId: user.id
        }
      });

      if (error) {
        console.error('Content analysis error:', error);
        return null;
      }

      const result = data as ContentAnalysisResult;
      console.log('✅ Content analysis completed:', {
        topicsDetected: result.detected_topics.length,
        qualityScore: result.content_quality_score,
        recommendedTopics: result.recommended_next_topics.length
      });

      // Cache the result
      setAnalysisCache(prev => new Map(prev.set(cacheKey, result)));

      return result;

    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.id, analysisCache]);

  const getTopicSuggestions = useCallback(async (
    userContent: string[],
    subject: string
  ): Promise<string[]> => {
    if (!user?.id || userContent.length === 0) return [];

    try {
      // Analyze all user content to understand their knowledge base
      const analyses = await Promise.all(
        userContent.map(content => analyzeContent(content, 'note', subject))
      );

      const validAnalyses = analyses.filter(Boolean) as ContentAnalysisResult[];
      
      // Extract all detected topics and their relationships
      const knownTopics = new Set<string>();
      const allRecommendations = new Set<string>();

      validAnalyses.forEach(analysis => {
        analysis.detected_topics.forEach(topic => {
          knownTopics.add(topic.topic);
        });
        analysis.recommended_next_topics.forEach(topic => {
          allRecommendations.add(topic);
        });
      });

      // Filter recommendations to exclude already known topics
      const newRecommendations = Array.from(allRecommendations)
        .filter(topic => !knownTopics.has(topic))
        .slice(0, 5); // Top 5 recommendations

      console.log('🎯 AI-powered topic suggestions:', {
        knownTopics: knownTopics.size,
        totalRecommendations: allRecommendations.size,
        newRecommendations: newRecommendations.length
      });

      return newRecommendations;

    } catch (error) {
      console.error('Error getting topic suggestions:', error);
      return [];
    }
  }, [user?.id, analyzeContent]);

  const assessContentQuality = useCallback(async (
    content: string,
    contentType: 'note' | 'flashcard' | 'quiz'
  ): Promise<{
    score: number;
    improvements: string[];
    insights: any;
  } | null> => {
    const analysis = await analyzeContent(content, contentType);
    
    if (!analysis) return null;

    return {
      score: analysis.content_quality_score,
      improvements: analysis.suggested_improvements,
      insights: analysis.learning_style_insights
    };
  }, [analyzeContent]);

  return {
    analyzeContent,
    getTopicSuggestions,
    assessContentQuality,
    isAnalyzing,
    clearCache: () => setAnalysisCache(new Map())
  };
};
