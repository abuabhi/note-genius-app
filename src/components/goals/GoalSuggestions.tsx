
import { Star, RefreshCw, Settings, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoalTemplate } from '@/hooks/useStudyGoals';

interface GoalSuggestionsProps {
  suggestions: GoalTemplate[];
  suggestionsEnabled: boolean;
  onCreateFromTemplate: (template: GoalTemplate) => Promise<void>;
  onDismissSuggestion: (templateTitle: string) => void;
  onToggleSuggestions: () => void;
  onRefreshSuggestions: () => void;
}

export const GoalSuggestions = ({ 
  suggestions, 
  suggestionsEnabled, 
  onCreateFromTemplate, 
  onDismissSuggestion, 
  onToggleSuggestions, 
  onRefreshSuggestions 
}: GoalSuggestionsProps) => {
  if (!suggestionsEnabled) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Goal Suggestions Disabled</h3>
              <p className="text-sm text-gray-600">Enable suggestions to get personalized goal recommendations</p>
            </div>
            <Button
              onClick={onToggleSuggestions}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Star className="h-4 w-4 mr-2" />
              Enable Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Suggested Goals for You
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {suggestions.length} available
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRefreshSuggestions}
              className="h-8 text-xs border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleSuggestions}
              className="h-8 text-xs border-purple-200 hover:bg-purple-50 text-purple-600"
            >
              <Settings className="h-3 w-3 mr-1" />
              Stop suggesting
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((template, index) => (
            <div 
              key={index}
              className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow relative"
            >
              <button
                onClick={() => onDismissSuggestion(template.title)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss suggestion"
              >
                <X className="h-4 w-4" />
              </button>
              <div 
                className="cursor-pointer"
                onClick={() => onCreateFromTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2 pr-6">
                  <h4 className="font-medium text-sm">{template.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                <div className="text-xs text-purple-600">
                  {template.target_hours}h • {template.duration_days} days
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
