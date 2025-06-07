
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Target, ChevronRight, Sparkles, TrendingUp, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdaptiveLearning } from "@/hooks/progress/adaptive";
import { getTodaysScheduleRecommendations } from "@/hooks/progress/adaptive/realScheduleOptimization";

export const StudyScheduleCard = () => {
  const { adaptiveLearningInsights, isLoading } = useAdaptiveLearning();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            AI Study Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { studySchedule } = adaptiveLearningInsights;
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Check if we have enough data for personalized recommendations
  const hasOptimalTimes = studySchedule.optimizedTimes.length > 0;
  const hasWeeklyPattern = studySchedule.weeklyPattern.length > 0;

  if (!hasOptimalTimes && !hasWeeklyPattern) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            AI Study Schedule
          </CardTitle>
          <p className="text-gray-600 text-sm">Start studying to unlock personalized scheduling</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Your personalized study schedule will appear here once you complete a few study sessions.
            </p>
            
            <div className="space-y-2">
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/flashcards" className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Start Studying
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  AI-Powered Scheduling
                </p>
                <p className="text-xs text-blue-700">
                  AI will analyze your study patterns to find your optimal study times.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get today's recommendations
  const todaysRecommendations = getTodaysScheduleRecommendations(studySchedule);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          AI Study Schedule
        </CardTitle>
        <p className="text-gray-600 text-sm">Personalized based on your study patterns</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Today, {todayStr}</h3>
            <Badge variant="outline" className="text-xs">Optimized</Badge>
          </div>
          
          {/* Current Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Right Now</p>
                <p className="text-sm text-blue-700">
                  {todaysRecommendations.currentRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Optimal Time Slots */}
          {studySchedule.optimizedTimes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Your Optimal Study Times</h4>
              {studySchedule.optimizedTimes.slice(0, 3).map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <div className="text-xs text-gray-600">
                          {Math.round(slot.efficiencyScore * 100)}% efficiency • {slot.cognitiveLoad} focus
                        </div>
                      </div>
                    </div>
                    {slot.recommendedSubjects.length > 0 && (
                      <div className="mt-1 ml-7">
                        <span className="text-xs text-blue-600">
                          Best for: {slot.recommendedSubjects.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Break Recommendations */}
        {studySchedule.adaptiveBreaks.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Breaks</h4>
            <div className="space-y-2">
              {studySchedule.adaptiveBreaks.map((breakRec, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    After {breakRec.afterMinutes} min: {breakRec.suggestedActivity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {breakRec.durationMinutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
            <Link to="/flashcards" className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4" />
              Study Now
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/calendar" className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              View Full Schedule
            </Link>
          </Button>
        </div>

        {/* AI Enhancement Notice */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Adaptive Scheduling
              </p>
              <p className="text-xs text-blue-700">
                Schedule automatically adjusts based on your performance patterns and preferences.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
