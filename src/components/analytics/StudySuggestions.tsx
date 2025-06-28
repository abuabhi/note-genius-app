import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudySuggestions } from "@/hooks/useStudySuggestions";
import { useNavigate, useLocation } from "react-router-dom";
import { useUnifiedSessionTracker } from "@/hooks/useUnifiedSessionTracker";
import { toast } from "sonner";

interface StudySuggestionsProps {
  subjectAnalytics?: any;
}

export const StudySuggestions = ({ subjectAnalytics }: StudySuggestionsProps) => {
  const { suggestions, isLoading } = useStudySuggestions(subjectAnalytics);
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession } = useUnifiedSessionTracker();
  const [isStarting, setIsStarting] = useState(false);

  const handleSuggestionClick = async (suggestion: any) => {
    try {
      console.log("🎯 CTA clicked:", suggestion);

      // Handle different suggestion types with smart contextual actions
      switch (suggestion.type) {
        case 'schedule':
          // For schedule suggestions: Start a unified session that shows timer
          console.log("🚀 Starting unified session for:", suggestion.subject);
          
          setIsStarting(true);
          const sessionData = {
            title: suggestion.subject ? `${suggestion.subject} Study Session` : "Study Session",
            subject: suggestion.subject || undefined,
            notes: `Started from AI suggestion: ${suggestion.title}`,
            activityType: 'general' as const
          };

          await startSession(sessionData);
          toast.success(`Study session started! Timer is now active.`);
          setIsStarting(false);
          break;

        case 'focus':
          // Navigate to flashcards with subject filter
          console.log("🎯 Navigating to flashcards with subject:", suggestion.subject);
          if (suggestion.subject) {
            navigate(`/flashcards?subject=${encodeURIComponent(suggestion.subject)}`);
          } else {
            navigate('/flashcards');
          }
          break;

        case 'performance':
          // Navigate to flashcards for performance improvement
          console.log("📈 Navigating to flashcards for performance:", suggestion.subject);
          if (suggestion.subject) {
            navigate(`/flashcards?subject=${encodeURIComponent(suggestion.subject)}`);
          } else {
            navigate('/flashcards');
          }
          break;

        case 'motivation':
          // For motivation suggestions, just show encouraging message
          if (suggestion.subject) {
            toast.success(`Keep up the great work in ${suggestion.subject}!`);
          } else {
            toast.success("You're doing amazing! Keep up the momentum!");
          }
          break;

        default:
          console.log("🔄 Unknown suggestion type:", suggestion.type);
          break;
      }
    } catch (error) {
      console.error("❌ Error handling suggestion click:", error);
      toast.error("Action failed. Please try again.");
      setIsStarting(false);
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
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
                  <p className="text-xs text-gray-600">{suggestion.description}</p>
                </div>
                
                {/* Button moved to the right side */}
                {suggestion.actionable && (
                  <div className="flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isStarting}
                      className="bg-purple-600 hover:bg-purple-700 text-white h-8 text-xs whitespace-nowrap"
                    >
                      {suggestion.type === 'schedule'
                        ? isStarting 
                          ? 'Starting...'
                          : 'Start Session Now'
                        : suggestion.type === 'focus'
                        ? 'Study Now'
                        : suggestion.type === 'performance'
                        ? 'Improve Now'
                        : 'Take Action'
                      }
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
