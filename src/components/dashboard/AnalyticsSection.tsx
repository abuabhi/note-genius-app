
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";
import { 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  ArrowRight,
  Zap
} from "lucide-react";

export const AnalyticsSection = () => {
  const navigate = useNavigate();
  const { analytics, isLoading } = useUltraSimpleAnalytics();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  const formatAccuracy = (accuracy: number) => {
    return `${accuracy.toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg border border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Study Sessions",
      value: analytics.totalSessions.toFixed(0),
      subtitle: `${analytics.todayStudyTimeMinutes.toFixed(0)}m today`,
      icon: Clock,
      color: "mint"
    },
    {
      title: "Total Study Time",
      value: formatTime(analytics.totalStudyTimeMinutes),
      subtitle: `${formatTime(analytics.weeklyStudyTimeMinutes)} this week`,
      icon: TrendingUp,
      color: "blue"
    },
    {
      title: "Study Streak",
      value: `${analytics.streakDays.toFixed(0)} days`,
      subtitle: analytics.weeklyChange >= 0 ? `+${analytics.weeklyChange.toFixed(0)}% this week` : `${analytics.weeklyChange.toFixed(0)}% this week`,
      icon: Zap,
      color: "yellow"
    },
    {
      title: "Learning Materials",
      value: `${analytics.totalSets.toFixed(0)} sets`,
      subtitle: `${analytics.totalNotes.toFixed(0)} notes created`,
      icon: BookOpen,
      color: "purple"
    }
  ];

  const getCardColors = (color: string) => {
    switch (color) {
      case 'mint':
        return 'bg-mint-50 border-mint-200';
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'purple':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColors = (color: string) => {
    switch (color) {
      case 'mint':
        return 'text-mint-600 bg-mint-100';
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Quick Analytics</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/analytics')}
          className="text-mint-600 border-mint-200 hover:bg-mint-50 font-medium"
        >
          View Full Analytics
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className={`${getCardColors(card.color)} border shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${getIconColors(card.color)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {card.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Goal Progress */}
      <Card className="mt-6 bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Target className="h-5 w-5 text-mint-600" />
            Weekly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {formatTime(analytics.weeklyStudyTimeMinutes)} / {analytics.weeklyGoalHours.toFixed(0)}h
            </span>
            <span className="text-sm font-semibold text-mint-600">
              {analytics.weeklyGoalProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-mint-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analytics.weeklyGoalProgress, 100).toFixed(0)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {analytics.weeklyGoalProgress >= 100 
              ? "🎉 Weekly goal completed!" 
              : `${(analytics.weeklyGoalHours * 60 - analytics.weeklyStudyTimeMinutes).toFixed(0)} minutes left to reach your goal`
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
