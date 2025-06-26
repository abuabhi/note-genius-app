
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTopicSuggestions } from '@/hooks/useTopicSuggestions';
import { Lightbulb, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopicSuggestionsWidgetProps {
  subjectName?: string;
  maxSuggestions?: number;
  className?: string;
}

export const TopicSuggestionsWidget: React.FC<TopicSuggestionsWidgetProps> = ({
  subjectName = 'Mathematics', // Default to Mathematics
  maxSuggestions = 3,
  className = ""
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    cachedSuggestions, 
    getSuggestions, 
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

  const handleCreateNote = (topic: string) => {
    navigate(`/notes/new?subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(topic)}`);
  };

  const handleViewAllSuggestions = () => {
    navigate(`/suggestions?subject=${encodeURIComponent(subjectName)}`);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-mint-500 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-600">Loading suggestions...</span>
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
            <TrendingUp className="h-4 w-4 text-mint-500" />
            Suggested Topics
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="h-6 px-2 text-xs"
          >
            {isGenerating ? 'Loading...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!cachedSuggestions ? (
          <div className="text-center py-3">
            <Lightbulb className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">Get personalized suggestions</p>
            <Button 
              size="sm" 
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="text-xs"
            >
              {isGenerating ? 'Generating...' : 'Get Suggestions'}
            </Button>
          </div>
        ) : cachedSuggestions.suggestions.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-xs text-gray-600">No new suggestions available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cachedSuggestions.suggestions
              .slice(0, isExpanded ? undefined : maxSuggestions)
              .map((suggestion, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.topic_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {suggestion.difficulty_level} • {Math.round(suggestion.confidence_score * 100)}% match
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateNote(suggestion.topic_name)}
                  className="h-8 px-2 text-xs flex-shrink-0 ml-2"
                >
                  Create Note
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
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
                    Show {cachedSuggestions.suggestions.length - maxSuggestions} more
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
                      View all suggestions
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
