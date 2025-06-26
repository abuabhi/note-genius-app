
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTopicSuggestions } from '@/hooks/useTopicSuggestions';
import { TopicSuggestion } from '@/types/topicSuggestions';
import { BookOpen, Brain, FileText, Lightbulb, Star } from 'lucide-react';
import { toast } from 'sonner';

interface TopicSuggestionsCardProps {
  subjectName: string;
  onCreateResource?: (topic: string, resourceType: 'note' | 'flashcard' | 'quiz') => void;
  className?: string;
}

export const TopicSuggestionsCard: React.FC<TopicSuggestionsCardProps> = ({
  subjectName,
  onCreateResource,
  className = ""
}) => {
  const { 
    cachedSuggestions, 
    getSuggestions, 
    trackProgress, 
    isLoading, 
    isGenerating 
  } = useTopicSuggestions(subjectName);

  const handleGenerateSuggestions = async () => {
    try {
      await getSuggestions(subjectName);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const handleCreateResource = async (topic: string, resourceType: 'note' | 'flashcard' | 'quiz') => {
    try {
      await trackProgress(subjectName, topic, resourceType);
      onCreateResource?.(topic, resourceType);
      toast.success(`Creating ${resourceType} for ${topic}`);
    } catch (error) {
      console.error('Error tracking progress:', error);
      toast.error('Failed to track progress');
    }
  };

  const getResourceIcon = (type: 'note' | 'flashcard' | 'quiz') => {
    switch (type) {
      case 'note': return <FileText className="h-3 w-3" />;
      case 'flashcard': return <Brain className="h-3 w-3" />;
      case 'quiz': return <BookOpen className="h-3 w-3" />;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'prerequisite_completed': return 'Prerequisites completed';
      case 'related_topic': return 'Related to your progress';
      case 'difficulty_progression': return 'Next level difficulty';
      case 'curriculum_sequence': return 'Curriculum sequence';
      case 'popular_combination': return 'Popular combination';
      default: return 'Recommended';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Topic Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-mint-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading suggestions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Topic Suggestions for {subjectName}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!cachedSuggestions ? (
          <div className="text-center py-4">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">Get personalized topic suggestions</p>
            <Button onClick={handleGenerateSuggestions} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </div>
        ) : cachedSuggestions.suggestions.length === 0 ? (
          <div className="text-center py-4">
            <Star className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Great job! You've covered most topics in this subject.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Based on your progress, here are suggested topics to explore:
            </p>
            
            {cachedSuggestions.suggestions.slice(0, 4).map((suggestion: TopicSuggestion, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{suggestion.topic_name}</h4>
                    {suggestion.topic_description && (
                      <p className="text-sm text-gray-600 mt-1">{suggestion.topic_description}</p>
                    )}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getConfidenceColor(suggestion.confidence_score)}`}
                  >
                    {Math.round(suggestion.confidence_score * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {getReasonText(suggestion.reason)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Level {suggestion.difficulty_level}
                  </Badge>
                  {suggestion.related_to.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Related to: {suggestion.related_to.slice(0, 2).join(', ')}
                      {suggestion.related_to.length > 2 && '...'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {suggestion.suggested_resources.map((resourceType) => (
                    <Button
                      key={resourceType}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateResource(suggestion.topic_name, resourceType)}
                      className="flex items-center gap-1"
                    >
                      {getResourceIcon(resourceType)}
                      Create {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            
            {cachedSuggestions.suggestions.length > 4 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleGenerateSuggestions}
              >
                View All {cachedSuggestions.suggestions.length} Suggestions
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
