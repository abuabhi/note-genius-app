
import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, Target, AlertCircle, Coffee } from "lucide-react";
import { useAdvancedAnalytics } from "@/hooks/progress/useAdvancedAnalytics";
import { useNavigate } from "react-router-dom";

export const StudyRecommendationsCard = () => {
  const { advancedAnalytics, isLoading } = useAdvancedAnalytics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <ProgressCard title="AI Study Recommendations" icon={Lightbulb}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { studyRecommendations } = advancedAnalytics;

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'focus_subject': return <Target className="h-4 w-4" />;
      case 'take_break': return <Coffee className="h-4 w-4" />;
      case 'review_weak_areas': return <AlertCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleRecommendationAction = (recommendation: any) => {
    switch (recommendation.type) {
      case 'focus_subject':
        navigate('/flashcards');
        break;
      case 'review_weak_areas':
        navigate('/flashcards');
        break;
      case 'maintain_pace':
        navigate('/goals');
        break;
      default:
        break;
    }
  };

  if (studyRecommendations.length === 0) {
    return (
      <ProgressCard title="AI Study Recommendations" icon={Lightbulb}>
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-mint-400" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">
            You're doing great! Keep up your current study routine.
          </p>
        </div>
      </ProgressCard>
    );
  }

  return (
    <ProgressCard title="AI Study Recommendations" icon={Lightbulb}>
      <div className="space-y-4">
        {studyRecommendations.map((recommendation, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-mint-100 rounded-lg text-mint-600">
                {getRecommendationIcon(recommendation.type)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority.toUpperCase()} PRIORITY
                  </Badge>
                  {recommendation.subject && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {recommendation.subject}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-800 font-medium">
                  {recommendation.message}
                </p>
                
                <p className="text-xs text-gray-600">
                  <strong>Expected impact:</strong> {recommendation.estimatedImpact}
                </p>
                
                {recommendation.type !== 'take_break' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRecommendationAction(recommendation)}
                    className="text-mint-600 border-mint-200 hover:bg-mint-50"
                  >
                    Take Action
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Overall Recommendation Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-mint-50 to-blue-50 rounded-lg border border-mint-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-mint-600" />
            <span className="text-sm font-medium text-mint-800">
              Weekly Focus
            </span>
          </div>
          <p className="text-sm text-mint-700">
            This week, prioritize{' '}
            {studyRecommendations.find(r => r.priority === 'high')?.type === 'focus_subject' ? 
              'improving weak subjects' : 
              'maintaining consistent study habits'
            } for maximum learning impact.
          </p>
        </div>
      </div>
    </ProgressCard>
  );
};
