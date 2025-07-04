
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEnhancedStudySuggestions, EnhancedStudySuggestion } from "@/hooks/useEnhancedStudySuggestions";
import { useUserProgressState } from "@/hooks/useUserProgressState";
import { 
  AlertTriangle, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  ArrowRight, 
  Brain,
  Rocket, 
  Sparkles,
  Zap,
  GraduationCap,
  Calendar,
  PenTool,
  Lightbulb
} from "lucide-react";

interface StudySuggestionsProps {
  subjectAnalytics?: any;
}

export const StudySuggestions = ({ subjectAnalytics }: StudySuggestionsProps) => {
  const navigate = useNavigate();
  const progressState = useUserProgressState();
  const { suggestions, isLoading } = useEnhancedStudySuggestions(progressState);

  const getIcon = (type: string, iconEmoji: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-5 w-5" />;
      case 'important': return <Target className="h-5 w-5" />;
      case 'growth': return <TrendingUp className="h-5 w-5" />;
      case 'routine': return <Clock className="h-5 w-5" />;
      case 'motivation': return <Sparkles className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300 font-semibold';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200 font-medium';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-mint-50 text-mint-700 border-mint-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-500';
      case 'important': return 'bg-blue-500';
      case 'growth': return 'bg-green-500';
      case 'routine': return 'bg-purple-500';
      case 'motivation': return 'bg-mint-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSuggestionAction = (suggestion: any) => {
    if (suggestion.actionUrl) {
      navigate(suggestion.actionUrl);
      return;
    }

    // Fallback navigation based on suggestion ID or type
    switch (suggestion.id) {
      case 'create-first-note':
      case 'create-first-study-note':
        navigate('/notes');
        break;
      case 'set-first-goal':
      case 'set-study-goals':
      case 'overdue-goal':
      case 'critical-overdue-goals':
        navigate('/goals');
        break;
      case 'notes-to-flashcards':
        navigate('/notes/study/convert');
        break;
      case 'create-quiz-from-notes':
        navigate('/quiz/create');
        break;
      case 'start-daily-session':
      case 'resume-routine':
        navigate('/study-sessions');
        break;
      case 'review-flashcards':
      case 'improve-mastery':
        navigate('/flashcards');
        break;
      case 'overdue-todos':
      case 'quick-start-todo':
        navigate('/todos');
        break;
      case 'optimize-schedule':
      case 'discover-ai-features':
        navigate('/analytics');
        break;
      case 'improve-quiz-performance':
        navigate('/quiz');
        break;
      default:
        // Fallback based on type
        switch (suggestion.type) {
          case 'urgent':
          case 'important':
            navigate('/goals');
            break;
          case 'growth':
            navigate('/notes');
            break;
          case 'routine':
            navigate('/study-sessions');
            break;
          default:
            navigate('/dashboard');
            break;
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Smart prioritization - always show critical/high priority first, ensure 3-4 suggestions
  const prioritizedSuggestions = suggestions
    .sort((a, b) => {
      const getPriorityScore = (suggestion: any) => {
        if (suggestion.priority === 'critical') return 8;
        if (suggestion.actionable && suggestion.priority === 'high') return 7;
        if (suggestion.priority === 'high') return 6;
        if (suggestion.actionable && suggestion.priority === 'medium') return 5;
        if (suggestion.priority === 'medium') return 4;
        if (suggestion.actionable && suggestion.priority === 'low') return 3;
        return 2;
      };
      return getPriorityScore(b) - getPriorityScore(a);
    });

  // Ensure 3-4 suggestions with smart fallbacks
  let finalSuggestions = prioritizedSuggestions.slice(0, 4);
  
  // If we have less than 3 suggestions, add fallback motivational suggestions
  if (finalSuggestions.length < 3) {
    const fallbackSuggestions: EnhancedStudySuggestion[] = [
      {
        id: 'motivational-tip-1',
        type: 'motivation',
        priority: 'low',
        title: 'Stay consistent with your studies',
        description: 'Regular, short study sessions are more effective than long, infrequent ones',
        actionable: false,
        icon: '💪'
      },
      {
        id: 'motivational-tip-2',
        type: 'growth',
        priority: 'low',
        title: 'Explore new study techniques',
        description: 'Try different methods like spaced repetition or active recall to optimize learning',
        actionable: true,
        icon: '🧠',
        actionUrl: '/help'
      }
    ];
    
    const needed = 3 - finalSuggestions.length;
    finalSuggestions = [...finalSuggestions, ...fallbackSuggestions.slice(0, needed)];
  }

  if (finalSuggestions.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-mint-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">You're all caught up!</h3>
          <p className="text-gray-600 font-medium">Keep up the great work with your studies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
      {/* Header Section */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-mint-900">AI Study Suggestions</h2>
              <p className="text-gray-600 text-sm font-medium">Smart recommendations based on your learning patterns</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-mint-50 text-mint-700 border-mint-200 font-semibold px-3 py-1">
            {finalSuggestions.length} suggestion{finalSuggestions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {finalSuggestions.map((suggestion, index) => (
            <div 
              key={suggestion.id}
              className="relative group p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 min-h-[220px] flex flex-col"
            >
              {/* Priority indicator */}
              <div className="absolute top-4 right-4">
                <div className={`w-3 h-3 rounded-full ${getTypeColor(suggestion.type)}`}></div>
              </div>

              {/* Header with icon and badge */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-lg ${getTypeColor(suggestion.type)} bg-opacity-10`}>
                  <div className={`${getTypeColor(suggestion.type)} text-white p-1 rounded`}>
                    {getIcon(suggestion.type, suggestion.icon)}
                  </div>
                </div>
                <Badge className={`text-xs font-semibold px-2 py-1 ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority === 'critical' ? '🚨 URGENT' : suggestion.priority.toUpperCase()}
                </Badge>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight group-hover:text-mint-600 transition-colors">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 font-medium">
                  {suggestion.description}
                </p>
                
                {/* Metadata */}
                {suggestion.metadata && (
                  <div className="text-xs text-gray-500 mb-4 font-medium">
                    {suggestion.metadata.count && `${suggestion.metadata.count} items • `}
                    {suggestion.metadata.daysOverdue && `${suggestion.metadata.daysOverdue} days overdue • `}
                    {suggestion.metadata.percentage && `${suggestion.metadata.percentage}% score • `}
                    {suggestion.metadata.lastActivity && `Last: ${suggestion.metadata.lastActivity}`}
                  </div>
                )}
              </div>
              
              {/* Action button */}
              {suggestion.actionable ? (
                <Button 
                  onClick={() => handleSuggestionAction(suggestion)}
                  className="w-full bg-mint-500 hover:bg-mint-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 group-hover:shadow-md"
                >
                  Take Action
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <div className="w-full py-2.5 text-center">
                  <span className="text-sm text-gray-500 font-medium">No action needed</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-mint-600" />
              <p className="text-sm text-gray-600 font-medium">
                Powered by AI analysis of your study habits and performance
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/analytics')}
              className="text-mint-600 border-mint-200 hover:bg-mint-50 font-semibold"
            >
              View Detailed Analytics
              <TrendingUp className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
