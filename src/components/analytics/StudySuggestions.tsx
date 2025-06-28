
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useStudySuggestions } from "@/hooks/useStudySuggestions";
import { Clock, Target, TrendingUp, BookOpen, ArrowRight } from "lucide-react";

interface StudySuggestionsProps {
  subjectAnalytics?: any;
}

export const StudySuggestions = ({ subjectAnalytics }: StudySuggestionsProps) => {
  const navigate = useNavigate();
  const { suggestions, isLoading } = useStudySuggestions(subjectAnalytics);

  const getIcon = (type: string, iconEmoji: string) => {
    switch (type) {
      case 'schedule': return <Clock className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'focus': return <Target className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-mint-50 text-mint-700 border-mint-200';
    }
  };

  const handleSuggestionAction = (suggestion: any) => {
    switch (suggestion.type) {
      case 'schedule':
        navigate('/study-planner');
        break;
      case 'focus':
        navigate('/flashcards');
        break;
      case 'performance':
        navigate('/analytics');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8 bg-white border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Limit to only 3 suggestions and prioritize actionable ones
  const limitedSuggestions = suggestions
    .filter(s => s.actionable || s.priority === 'high')
    .slice(0, 3);

  if (limitedSuggestions.length === 0) {
    return (
      <Card className="mb-8 bg-white border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-mint-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">You're all caught up!</h3>
          <p className="text-gray-600 font-medium">Keep up the great work with your studies.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-6 h-6 bg-mint-100 rounded-full flex items-center justify-center">
            <Target className="h-4 w-4 text-mint-600" />
          </div>
          AI Study Suggestions
          <Badge variant="outline" className="text-xs bg-mint-50 text-mint-700 border-mint-200 font-medium">
            Personalized for you
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {limitedSuggestions.map((suggestion, index) => (
            <div 
              key={suggestion.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-mint-100 rounded-md text-mint-600">
                    {getIcon(suggestion.type, suggestion.icon)}
                  </div>
                  <Badge className={`text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                {suggestion.title}
              </h4>
              <p className="text-xs text-gray-600 mb-3 font-medium">
                {suggestion.description}
              </p>
              
              {suggestion.actionable && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionAction(suggestion)}
                  className="w-full text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
                >
                  Take Action
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Based on your study patterns and goals
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/analytics')}
              className="text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
            >
              View Full Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
