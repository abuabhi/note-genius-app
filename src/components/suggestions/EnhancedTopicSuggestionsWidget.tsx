
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedTopicSuggestions } from '@/hooks/useEnhancedTopicSuggestions';
import { Brain, TrendingUp, ChevronRight, Sparkles, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnhancedTopicSuggestionsWidgetProps {
  subjectName?: string;
  maxSuggestions?: number;
  className?: string;
}

export const EnhancedTopicSuggestionsWidget: React.FC<EnhancedTopicSuggestionsWidgetProps> = ({
  subjectName = 'Mathematics',
  maxSuggestions = 4,
  className = ""
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    cachedSuggestions, 
    generateEnhancedSuggestions, 
    isLoading, 
    isGenerating 
  } = useEnhancedTopicSuggestions(subjectName);

  const handleGenerateSuggestions = async () => {
    try {
      await generateEnhancedSuggestions(subjectName);
    } catch (error) {
      console.error('Error generating enhanced suggestions:', error);
    }
  };

  const handleCreateResource = (topic: string, resourceType: 'note' | 'flashcard' | 'quiz') => {
    const params = new URLSearchParams({
      subject: subjectName,
      topic: topic
    });

    switch (resourceType) {
      case 'note':
        navigate(`/notes/new?${params.toString()}`);
        break;
      case 'flashcard':
        navigate(`/flashcards/create?${params.toString()}`);
        break;
      case 'quiz':
        navigate(`/quiz/create?${params.toString()}`);
        break;
    }
  };

  const handleViewAllSuggestions = () => {
    navigate(`/suggestions?subject=${encodeURIComponent(subjectName)}`);
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'ai_recommended': return <Brain className="h-3 w-3 text-purple-500" />;
      case 'prerequisite_completed': return <Target className="h-3 w-3 text-green-500" />;
      case 'related_topic': return <TrendingUp className="h-3 w-3 text-blue-500" />;
      default: return <Sparkles className="h-3 w-3 text-mint-500" />;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'ai_recommended': return 'AI Recommended';
      case 'prerequisite_completed': return 'Prerequisites Met';
      case 'related_topic': return 'Related to Progress';
      case 'curriculum_sequence': return 'Next in Sequence';
      default: return 'Suggested';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-mint-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-600">Loading AI suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            AI-Powered Suggestions
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="h-6 px-2 text-xs"
          >
            {isGenerating ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Refresh
              </div>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!cachedSuggestions ? (
          <div className="text-center py-3">
            <Brain className="h-8 w-8 text-purple-300 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">Get AI-powered personalized suggestions</p>
            <Button 
              size="sm" 
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="text-xs bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? 'Analyzing Content...' : 'Generate AI Suggestions'}
            </Button>
          </div>
        ) : cachedSuggestions.suggestions.length === 0 ? (
          <div className="text-center py-3">
            <Sparkles className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Great progress! Keep exploring new topics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cachedSuggestions.suggestions
              .slice(0, isExpanded ? undefined : maxSuggestions)
              .map((suggestion, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.topic_name}
                    </h4>
                    {suggestion.topic_description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {suggestion.topic_description}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ml-2 ${getConfidenceColor(suggestion.confidence_score)}`}
                  >
                    {Math.round(suggestion.confidence_score * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    {getReasonIcon(suggestion.reason)}
                    {getReasonText(suggestion.reason)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Level {suggestion.difficulty_level}
                  </Badge>
                  {suggestion.related_to.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{suggestion.related_to.length} related
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {suggestion.suggested_resources.slice(0, 2).map((resourceType) => (
                    <Button
                      key={resourceType}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateResource(suggestion.topic_name, resourceType)}
                      className="flex items-center gap-1 text-xs h-7 px-2"
                    >
                      Create {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            
            {cachedSuggestions.suggestions.length > maxSuggestions && (
              <div className="pt-2 border-t">
                {!isExpanded ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="w-full text-xs"
                  >
                    Show {cachedSuggestions.suggestions.length - maxSuggestions} more AI suggestions
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="flex-1 text-xs"
                    >
                      Show less
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewAllSuggestions}
                      className="flex-1 text-xs"
                    >
                      View all AI suggestions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
