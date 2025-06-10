
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SmartSuggestion } from '../types/noteChat';
import { Lightbulb, MessageSquare, FileText, ArrowRight } from 'lucide-react';

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onSelectSuggestion: (suggestion: string) => void;
  isLoading?: boolean;
}

export const SmartSuggestions = ({ 
  suggestions, 
  onSelectSuggestion, 
  isLoading 
}: SmartSuggestionsProps) => {
  if (suggestions.length === 0 || isLoading) return null;

  const getIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-3 w-3" />;
      case 'action':
        return <ArrowRight className="h-3 w-3" />;
      case 'summary':
        return <FileText className="h-3 w-3" />;
      default:
        return <Lightbulb className="h-3 w-3" />;
    }
  };

  return (
    <Card className="p-3 bg-mint-50 border-mint-200">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-mint-600" />
        <span className="text-sm font-medium text-mint-700">Smart Suggestions</span>
      </div>
      <div className="space-y-1">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-left h-auto p-2 text-xs hover:bg-mint-100"
            onClick={() => onSelectSuggestion(suggestion.text)}
          >
            <span className="flex items-center gap-2">
              {getIcon(suggestion.type)}
              <span className="truncate">{suggestion.text}</span>
            </span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
