
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudySuggestions } from "@/hooks/useStudySuggestions";
import { useNavigate, useLocation } from "react-router-dom";
import { CreateSessionDialog } from "@/components/study/CreateSessionDialog";
import { toast } from "sonner";

interface StudySuggestionsProps {
  subjectAnalytics?: any;
}

export const StudySuggestions = ({ subjectAnalytics }: StudySuggestionsProps) => {
  const { suggestions, isLoading } = useStudySuggestions(subjectAnalytics);
  const navigate = useNavigate();
  const location = useLocation();
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [sessionDefaults, setSessionDefaults] = useState({ title: "", subject: "" });

  const handleSuggestionClick = (suggestion: any) => {
    const currentPath = location.pathname;

    // Handle different suggestion types with smart contextual actions
    switch (suggestion.type) {
      case 'schedule':
        if (suggestion.actionUrl === '/study-sessions' && currentPath === '/study-sessions') {
          // User is already on study sessions page - open creation dialog
          if (suggestion.id.includes('plan-behind') || suggestion.id === 'start-today') {
            setSessionDefaults({
              title: suggestion.subject ? `${suggestion.subject} Study Session` : "Study Session",
              subject: suggestion.subject || ""
            });
            setCreateSessionOpen(true);
          }
        } else if (suggestion.actionUrl) {
          // Navigate to different page
          if (suggestion.subject) {
            navigate(`${suggestion.actionUrl}?subject=${encodeURIComponent(suggestion.subject)}`);
          } else {
            navigate(suggestion.actionUrl);
          }
        }
        break;

      case 'focus':
        // Navigate to flashcards with subject filter
        if (suggestion.subject) {
          navigate(`/flashcards?subject=${encodeURIComponent(suggestion.subject)}`);
        } else {
          navigate('/flashcards');
        }
        break;

      case 'performance':
        // Navigate to flashcards for performance improvement
        if (suggestion.subject) {
          navigate(`/flashcards?subject=${encodeURIComponent(suggestion.subject)}`);
        } else {
          navigate('/flashcards');
        }
        break;

      case 'motivation':
        // For motivation suggestions, just show encouraging message and maybe navigate to relevant section
        if (suggestion.subject) {
          toast.success(`Keep up the great work in ${suggestion.subject}!`);
        } else {
          toast.success("You're doing amazing! Keep up the momentum!");
        }
        break;

      default:
        // Fallback to actionUrl if provided
        if (suggestion.actionUrl) {
          navigate(suggestion.actionUrl);
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-200 rounded animate-pulse"></div>
            AI Study Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">🤖</span>
            AI Study Suggestions
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {suggestions.length} personalized
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={suggestion.id || index}
                className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{suggestion.icon}</span>
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          suggestion.priority === 'high' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : suggestion.priority === 'medium'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                    {suggestion.actionable && (
                      <Button
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs"
                      >
                        {suggestion.type === 'schedule' && suggestion.id === 'start-today' 
                          ? 'Start Session Now'
                          : suggestion.type === 'schedule'
                          ? 'Continue Plan'
                          : suggestion.type === 'focus'
                          ? 'Study Now'
                          : suggestion.type === 'performance'
                          ? 'Improve'
                          : 'Take Action'
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateSessionDialog
        open={createSessionOpen}
        onOpenChange={setCreateSessionOpen}
        defaultTitle={sessionDefaults.title}
        defaultSubject={sessionDefaults.subject}
      />
    </>
  );
};
