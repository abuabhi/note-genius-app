import { Sparkles, RefreshCw, Settings, X, FileText, Layers, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GoalTemplate } from '@/types/study';

interface GoalSuggestionsProps {
  suggestions: GoalTemplate[];
  suggestionsEnabled: boolean;
  /** True when the user has at least one note / flashcard set / quiz. */
  hasContent?: boolean;
  onCreateFromTemplate: (template: GoalTemplate) => Promise<void>;
  onDismissSuggestion: (templateTitle: string) => void;
  onToggleSuggestions: () => void;
  onRefreshSuggestions: () => void;
}

export const GoalSuggestions = ({
  suggestions,
  suggestionsEnabled,
  hasContent = true,
  onCreateFromTemplate,
  onDismissSuggestion,
  onToggleSuggestions,
  onRefreshSuggestions,
}: GoalSuggestionsProps) => {
  // User turned suggestions off
  if (!suggestionsEnabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-foreground mb-1">Goal suggestions are off</h3>
              <p className="text-sm text-muted-foreground">
                Turn them back on to get goal ideas based on your notes, flashcards and quizzes.
              </p>
            </div>
            <Button onClick={onToggleSuggestions} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No content yet — guide the user to create something instead of fabricating goals
  if (!hasContent && suggestions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-mint-600" />
                Smart suggestions need something to work with
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a note, flashcard set or quiz first — we'll suggest goals based on your real material.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/notes">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Notes
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/flashcards">
                  <Layers className="h-3.5 w-3.5 mr-1.5" />
                  Flashcards
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/quizzes">
                  <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                  Quizzes
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nothing to suggest right now (e.g. all dismissed) but user has content — stay quiet
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-mint-600" />
            Suggested for you
            <Badge variant="secondary" className="text-xs">
              {suggestions.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onRefreshSuggestions} className="h-8 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleSuggestions}
              className="h-8 text-xs text-muted-foreground"
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
              className="p-4 bg-muted/30 rounded-lg border border-border hover:border-mint-300 hover:shadow-sm transition-all relative"
            >
              <button
                onClick={() => onDismissSuggestion(template.title)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss suggestion"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onCreateFromTemplate(template)}
                className="text-left w-full"
              >
                <div className="pr-6 mb-1">
                  <h4 className="font-medium text-sm text-foreground">{template.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template.description}
                </p>
                <div className="text-xs text-mint-700 font-medium">
                  {template.target_hours}h · {template.duration_days} days
                </div>
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
