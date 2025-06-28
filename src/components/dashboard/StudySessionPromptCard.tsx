
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, BookOpen, Target, Trophy, Clock } from "lucide-react";
import { ActiveStudySessionData } from "@/hooks/useActiveStudySessionData";
import { useStartStudySession } from "@/hooks/useStartStudySession";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface StudySessionPromptCardProps {
  sessionData: ActiveStudySessionData;
}

export const StudySessionPromptCard = ({ sessionData }: StudySessionPromptCardProps) => {
  const { startSession, isLoading } = useStartStudySession();
  const navigate = useNavigate();

  const handleStartSession = async () => {
    if (sessionData.currentActivePlan) {
      try {
        await startSession(sessionData.currentActivePlan);
        toast.success("Study session started!");
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    } else if (sessionData.hasActivePlans) {
      // Start with first available plan
      const firstPlan = sessionData.nextStudySession;
      if (firstPlan) {
        toast.success("Study session starting...");
      }
    } else {
      navigate('/study-planner');
    }
  };

  const handleCreatePlan = () => {
    navigate('/study-planner');
  };

  // Render different states based on urgentAction
  if (!sessionData.hasActivePlans) {
    return (
      <Card className="bg-gradient-to-r from-mint-50 to-blue-50 border-mint-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-mint-100 rounded-full">
                <BookOpen className="h-6 w-6 text-mint-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Start Your Learning Journey</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create your first study plan to begin tracking your progress
                </p>
              </div>
            </div>
            <Button onClick={handleCreatePlan} className="bg-mint-600 hover:bg-mint-700">
              Create Study Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessionData.urgentAction === 'continue_session') {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Session In Progress</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {sessionData.motivationalMessage}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Active now</span>
                </div>
              </div>
            </div>
            <Button onClick={handleStartSession} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              Continue Studying
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessionData.urgentAction === 'celebrate') {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Daily Goal Complete! 🎉</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {sessionData.motivationalMessage}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      {sessionData.todayProgress.timeStudiedMinutes} min studied
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleStartSession} variant="outline" className="border-yellow-300 hover:bg-yellow-50">
              Keep Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state - encourage to start studying
  return (
    <Card className="bg-gradient-to-r from-mint-50 to-blue-50 border-mint-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-mint-100 rounded-full">
              <BookOpen className="h-6 w-6 text-mint-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ready to Study?</h3>
              <p className="text-sm text-gray-600 mt-1">
                {sessionData.motivationalMessage}
              </p>
            </div>
          </div>
          <Button onClick={handleStartSession} disabled={isLoading} className="bg-mint-600 hover:bg-mint-700">
            {isLoading ? "Starting..." : "Start Studying"}
          </Button>
        </div>

        {/* Progress section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Today's Progress</span>
            <span className="font-medium text-mint-700">
              {sessionData.todayProgress.timeStudiedMinutes} / {sessionData.todayProgress.targetTimeMinutes} min
            </span>
          </div>
          <Progress 
            value={sessionData.todayProgress.completionPercentage} 
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{sessionData.todayProgress.completionPercentage}% complete</span>
            {sessionData.nextStudySession && (
              <span>Next: {sessionData.nextStudySession.planTitle}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
