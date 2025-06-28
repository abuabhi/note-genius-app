import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Timer, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useUnifiedSessionTracker } from "@/hooks/useUnifiedSessionTracker";
import { toast } from "sonner";
import { useState } from "react";

export const DashboardHeroSection = () => {
  const navigate = useNavigate();
  const { 
    totalStudyTime, 
    todaysActivity, 
    currentStreak, 
    weeklyComparison,
    weeklyGoalProgress,
    weeklyGoalHours
  } = useDashboardAnalytics();
  
  const { 
    isActive, 
    currentTitle, 
    elapsedSeconds, 
    isPaused,
    startSession, 
    togglePause,
    endSession 
  } = useUnifiedSessionTracker();
  
  const [isStartingSession, setIsStartingSession] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeepLearning = async () => {
    // If session is active, show options instead of starting new one
    if (isActive) {
      toast.info(`Active session: ${currentTitle}. Use the timer controls to manage it.`);
      return;
    }

    try {
      setIsStartingSession(true);
      await startSession({
        title: "Quick Study Session",
        subject: undefined,
        notes: "Started from dashboard Keep Learning button",
        activityType: 'general'
      });
      toast.success("Study session started! Timer is now active.");
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start session. Please try again.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleSessionControl = async () => {
    try {
      await togglePause();
      toast.success(isPaused ? "Session resumed" : "Session paused");
    } catch (error) {
      console.error('Error controlling session:', error);
      toast.error("Failed to control session");
    }
  };

  const handleEndSession = async () => {
    try {
      await endSession();
      toast.success("Session completed!");
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error("Failed to end session");
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back to your learning journey! 🎓
        </h1>
        <p className="text-gray-600">
          {isActive 
            ? `Currently studying: ${currentTitle} (${formatTime(elapsedSeconds)})`
            : "Ready to continue your studies?"
          }
        </p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Study Time Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Study Time</p>
                <p className="text-2xl font-bold text-blue-900">{totalStudyTime}h</p>
                <p className="text-xs text-blue-700 mt-1">
                  Today: {todaysActivity.studyTime}min
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Weekly Goal</p>
                <p className="text-2xl font-bold text-green-900">{Math.round(weeklyGoalProgress)}%</p>
                <p className="text-xs text-green-700 mt-1">
                  Target: {weeklyGoalHours}h/week
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Study Streak</p>
                <p className="text-2xl font-bold text-orange-900">{currentStreak} days</p>
                <p className="text-xs text-orange-700 mt-1">
                  Weekly: {weeklyComparison.trend === 'up' ? '↗️' : weeklyComparison.trend === 'down' ? '↘️' : '→'} {Math.abs(weeklyComparison.percentageChange)}%
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!isActive ? (
          // No active session - show Keep Learning button
          <Button 
            onClick={handleKeepLearning}
            disabled={isStartingSession}
            className="bg-mint-500 hover:bg-mint-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isStartingSession ? "Starting..." : "Keep Learning"}
          </Button>
        ) : (
          // Active session - show session controls
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSessionControl}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              onClick={handleEndSession}
              className="bg-mint-500 hover:bg-mint-600 text-white"
            >
              End Session
            </Button>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/flashcards')}
          className="border-mint-200 hover:bg-mint-50 text-mint-700 px-8 py-3 text-lg font-semibold rounded-lg"
        >
          Browse Flashcards
        </Button>
      </div>
    </div>
  );
};
