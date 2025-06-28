import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudySuggestions } from "@/hooks/useStudySuggestions";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface StudySuggestionsProps {
  subjectAnalytics?: any;
}

export const StudySuggestions = ({ subjectAnalytics }: StudySuggestionsProps) => {
  const { suggestions, isLoading } = useStudySuggestions(subjectAnalytics);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuggestionAction = (suggestion: any) => {
    console.log('🎯 Acting on suggestion:', suggestion);
    
    const currentPath = location.pathname;
    
    switch (suggestion.type) {
      case 'focus':
        if (currentPath === '/flashcards') {
          // Already on flashcards page - apply subject filter or scroll to top
          if (suggestion.subject) {
            navigate(`/flashcards?subject=${encodeURIComponent(suggestion.subject)}`);
            toast.success(`Filtering flashcards for ${suggestion.subject}`);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Focus on your flashcard studies!');
          }
        } else {
          // Navigate to flashcards with subject filter
          const url = suggestion.subject 
            ? `/flashcards?subject=${encodeURIComponent(suggestion.subject)}`
            : '/flashcards';
          navigate(url);
          toast.success(`Opening flashcards to focus on ${suggestion.title.replace('Focus on ', '')}`);
        }
        break;
        
      case 'schedule':
        if (currentPath === '/study-sessions') {
          // Already on study sessions - trigger contextual action
          if (suggestion.subject) {
            // Scroll to analytics section or refresh data
            const analyticsSection = document.querySelector('[data-testid="analytics-section"]');
            if (analyticsSection) {
              analyticsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            toast.success(`Let's focus on your ${suggestion.subject} study plan!`);
          } else {
            // Scroll to session creation area or show call-to-action
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Ready to start a new study session? Check the options above!');
          }
        } else if (currentPath === '/study-planner') {
          // Already on study planner - contextual action
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.success('Time to work on your study plans!');
        } else {
          // Navigate to appropriate page based on suggestion content
          if (suggestion.title.includes('study plan') || suggestion.actionUrl === '/study-planner') {
            navigate('/study-planner');
            toast.success('Opening study planner to organize your schedule');
          } else {
            navigate('/study-sessions');
            toast.success('Opening study sessions to schedule your time');
          }
        }
        break;
        
      case 'performance':
        if (currentPath === '/flashcards') {
          // Already on flashcards - apply subject filter or show performance focus
          if (suggestion.subject) {
            navigate(`/flashcards?subject=${encodeURIComponent(suggestion.subject)}`);
            toast.success(`Let's boost your ${suggestion.subject} performance!`);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Time to practice and improve your performance!');
          }
        } else {
          // Navigate to flashcards with subject filter
          const url = suggestion.subject 
            ? `/flashcards?subject=${encodeURIComponent(suggestion.subject)}`
            : '/flashcards';
          navigate(url);
          toast.success('Opening practice materials to boost performance');
        }
        break;
        
      case 'motivation':
        if (currentPath === '/goals') {
          // Already on goals page - scroll to top or refresh
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.success('Keep up the excellent work on your goals!');
        } else if (currentPath === '/progress') {
          // Already on progress page - show motivation
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.success('Look at your amazing progress! Keep it up!');
        } else {
          // Navigate to goals or progress page
          navigate('/goals');
          toast.success('Keep up the great momentum!');
        }
        break;
        
      default:
        // Fallback behavior
        if (currentPath === '/flashcards') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.success('Ready to study? Let\'s make progress!');
        } else {
          navigate('/flashcards');
          toast.success('Taking action on your study suggestion');
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Brain className="h-5 w-5" />
            AI Study Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Brain className="h-5 w-5" />
            AI Study Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-purple-900 mb-2">All caught up!</h3>
            <p className="text-purple-600">No immediate suggestions. Keep up the great work!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-5 w-5" />
          AI Study Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50 hover:bg-white/90 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {suggestion.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-purple-900 truncate">
                      {suggestion.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
              {suggestion.actionable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSuggestionAction(suggestion)}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 flex-shrink-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
