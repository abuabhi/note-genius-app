
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, BookOpen, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStartStudySession } from "@/hooks/useStartStudySession";

interface StudySessionPromptCardProps {
  sessionData?: any;
}

export const StudySessionPromptCard = ({ sessionData }: StudySessionPromptCardProps) => {
  const navigate = useNavigate();
  const { startSession, isLoading } = useStartStudySession();

  const handleStartStudying = () => {
    // Navigate to study planner page
    navigate('/study-planner');
  };

  const handleStartSession = async () => {
    if (!sessionData?.activeStudyPlan) {
      handleStartStudying();
      return;
    }

    try {
      await startSession(sessionData.activeStudyPlan);
    } catch (error) {
      console.error('Failed to start session:', error);
      // Fallback to study planner
      handleStartStudying();
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-mint-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Ready to Study?
              </h3>
              <p className="text-gray-600 text-sm">
                Start a focused study session or continue your learning journey
              </p>
              {sessionData?.todaysGoal && (
                <div className="flex items-center gap-2 mt-2">
                  <Target className="h-4 w-4 text-mint-600" />
                  <span className="text-sm text-mint-700 font-medium">
                    Today's Goal: {sessionData.todaysGoal}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {sessionData?.suggestedDuration && (
              <Badge variant="secondary" className="text-mint-700 bg-mint-100">
                <Clock className="h-3 w-3 mr-1" />
                {sessionData.suggestedDuration} min
              </Badge>
            )}
            <Button 
              onClick={handleStartStudying}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-mint-500 hover:from-blue-600 hover:to-mint-600 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Starting...' : 'Start Studying'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
