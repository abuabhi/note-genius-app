
import { useEffect, useState } from 'react';
import { useAdaptiveLearningIntegration } from '@/hooks/useAdaptiveLearningIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdaptiveStudyTrackerProps {
  sessionData: {
    subject?: string;
    accuracy: number;
    timeSpent: number;
    cardsReviewed: number;
    isActive: boolean;
  };
  onAdaptationAccepted?: (adaptation: any) => void;
}

export const AdaptiveStudyTracker = ({ 
  sessionData, 
  onAdaptationAccepted 
}: AdaptiveStudyTrackerProps) => {
  const [adaptations, setAdaptations] = useState<any[]>([]);
  const [dismissedAdaptations, setDismissedAdaptations] = useState<Set<string>>(new Set());
  
  const { 
    adaptToPerformance, 
    activeLearningPaths,
    updateLearningPathProgress 
  } = useAdaptiveLearningIntegration();

  // Generate real-time adaptations based on performance
  useEffect(() => {
    if (!sessionData.isActive) return;

    const newAdaptations = adaptToPerformance({
      accuracy: sessionData.accuracy,
      sessionDuration: sessionData.timeSpent,
      cardsReviewed: sessionData.cardsReviewed,
      subject: sessionData.subject
    });

    // Filter out dismissed adaptations
    const filteredAdaptations = newAdaptations?.filter(adaptation => 
      !dismissedAdaptations.has(`${adaptation.type}_${sessionData.subject}`)
    ) || [];

    setAdaptations(filteredAdaptations);
  }, [sessionData, adaptToPerformance, dismissedAdaptations]);

  const handleAcceptAdaptation = (adaptation: any) => {
    onAdaptationAccepted?.(adaptation);
    dismissAdaptation(adaptation);
  };

  const dismissAdaptation = (adaptation: any) => {
    const adaptationKey = `${adaptation.type}_${sessionData.subject}`;
    setDismissedAdaptations(prev => new Set(prev).add(adaptationKey));
  };

  const getAdaptationIcon = (type: string) => {
    switch (type) {
      case 'difficulty_reduction':
        return <Target className="h-4 w-4 text-orange-500" />;
      case 'difficulty_increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'break_suggestion':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const getAdaptationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  if (!sessionData.isActive || adaptations.length === 0) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Study Adaptations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {adaptations.map((adaptation, index) => (
          <Alert key={index} className={getAdaptationColor(adaptation.priority)}>
            <div className="flex items-start gap-3">
              {getAdaptationIcon(adaptation.type)}
              <div className="flex-1">
                <AlertDescription className="font-medium mb-2">
                  {adaptation.message}
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {adaptation.priority} priority
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAcceptAdaptation(adaptation)}
                      className="h-6 px-2 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => dismissAdaptation(adaptation)}
                      className="h-6 px-2 text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Alert>
        ))}

        {/* Active Learning Paths Summary */}
        {activeLearningPaths.length > 0 && (
          <div className="pt-3 border-t border-purple-200">
            <div className="text-sm font-medium text-purple-800 mb-2">
              Active Learning Paths: {activeLearningPaths.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {activeLearningPaths.slice(0, 3).map((path, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {path.subject}
                </Badge>
              ))}
              {activeLearningPaths.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{activeLearningPaths.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
