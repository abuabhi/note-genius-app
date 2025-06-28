
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudySuggestions } from "@/hooks/useStudySuggestions";
import { useNavigate, useLocation } from "react-router-dom";
import { useUnifiedSessionTracker } from "@/hooks/useUnifiedSessionTracker";
import { toast } from "sonner";
import { Sparkles, Brain, Target, Zap } from "lucide-react";

interface StudySuggestionsProps {
  subjectAnalytics?: any;
}

export const StudySuggestions = ({ subjectAnalytics }: StudySuggestionsProps) => {
  const { suggestions, isLoading } = useStudySuggestions(subjectAnalytics);
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession, isActive, currentTitle } = useUnifiedSessionTracker();
  const [isStarting, setIsStarting] = useState(false);

  const handleSuggestionClick = async (suggestion: any) => {
    try {
      console.log("🎯 CTA clicked:", suggestion);

      // Check if session is already active for schedule suggestions
      if (suggestion.type === 'schedule' && isActive) {
        toast.info(`Session already active: ${currentTitle}. End current session to start a new one.`);
        return;
      }

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="h-4 w-4 text-red-600" />;
      case 'medium': return <Zap className="h-4 w-4 text-yellow-600" />;
      default: return <Brain className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 border-purple-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-purple-200 rounded"></div>
            </div>
            <div>
              <div className="h-6 w-48 bg-purple-100 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-purple-50 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white/60 rounded-xl border border-purple-100 animate-pulse">
                <div className="h-4 bg-purple-100 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-purple-50 rounded w-full mb-2"></div>
                <div className="h-3 bg-purple-50 rounded w-2/3"></div>
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
    <Card className="mb-8 bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50 border-purple-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Study Suggestions
              </CardTitle>
              <p className="text-sm text-purple-600 mt-1">
                Personalized recommendations just for you
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
            {suggestions.length} Smart Tips
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => (
            <div 
              key={suggestion.id || index}
              className="group p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                {/* Header with icon and priority */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{suggestion.icon}</div>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(suggestion.priority)}
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 leading-snug">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
                
                {/* Action button */}
                {suggestion.actionable && (
                  <Button
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isStarting || (suggestion.type === 'schedule' && isActive)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 group-hover:shadow-md"
                  >
                    {suggestion.type === 'schedule'
                      ? isActive
                        ? 'Session Active'
                        : isStarting 
                        ? 'Starting...'
                        : 'Start Now'
                      : suggestion.type === 'focus'
                      ? 'Study This'
                      : suggestion.type === 'performance'
                      ? 'Improve Now'
                      : 'Take Action'
                    }
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
