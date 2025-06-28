
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Clock, Flame, ArrowRight } from "lucide-react";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";
import { useNavigate } from "react-router-dom";

export const AnalyticsSection = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-mint-50 h-32 rounded-lg border border-mint-200"></div>
      </div>
    );
  }

  // Format time helper
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-mint-900 mb-1">Quick Analytics</h2>
          <p className="text-mint-600 text-sm">Your learning progress at a glance</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/analytics')}
          className="border-mint-200 hover:bg-mint-50 text-mint-700"
        >
          View Full Analytics
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-800 mb-1">
              {formatTime(analytics.weeklyStudyTimeMinutes)}
            </div>
            <p className="text-xs text-blue-600">This Week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-4 text-center">
            <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-mint-800 mb-1">
              {analytics.streakDays}
            </div>
            <p className="text-xs text-mint-600">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-800 mb-1">
              {analytics.flashcardAccuracy}%
            </div>
            <p className="text-xs text-green-600">Accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-800 mb-1">
              {analytics.totalSessions}
            </div>
            <p className="text-xs text-purple-600">Sessions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
