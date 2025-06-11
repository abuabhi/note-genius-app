
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { SmartSuggestion } from '../types/suggestions';

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onSelectSuggestion: (suggestion: string) => void;
  isLoading?: boolean;
}

export const SmartSuggestions = ({ suggestions, onSelectSuggestion, isLoading }: SmartSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-mint-600" />
        <h4 className="text-sm font-medium text-gray-700">Suggested Questions</h4>
      </div>
      
      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            className="h-auto p-3 text-left justify-start text-wrap"
            onClick={() => onSelectSuggestion(suggestion.text)}
            disabled={isLoading}
          >
            {suggestion.text}
          </Button>
        ))}
      </div>
    </div>
  );
};
