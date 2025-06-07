
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Target, TrendingUp } from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

export const DashboardHeroSection = () => {
  const { 
    todayStudyTimeMinutes, 
    weeklyStudyTimeMinutes,
    totalSessions, 
    currentStreak, 
    weeklyComparison,
    weeklyGoalProgress,
    isLoading 
  } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Format weekly change
  const formatWeeklyChange = () => {
    if (weeklyComparison.percentageChange === 0) return "No change";
    const sign = weeklyComparison.percentageChange > 0 ? "+" : "";
    return `${sign}${weeklyComparison.percentageChange}%`;
  };

  const stats = [
    {
      title: "Today",
      value: formatTime(todayStudyTimeMinutes),
      icon: Clock,
      description: "Study time today",
      color: "text-blue-600"
    },
    {
      title: "This Week", 
      value: formatTime(weeklyStudyTimeMinutes),
      icon: TrendingUp,
      description: `${formatWeeklyChange()} from last week`,
      color: weeklyComparison.trend === 'up' ? "text-green-600" : 
             weeklyComparison.trend === 'down' ? "text-red-600" : "text-gray-600"
    },
    {
      title: "Weekly Goal",
      value: `${weeklyGoalProgress}%`,
      icon: Target,
      description: `${formatTime(weeklyStudyTimeMinutes)} / 5h`,
      color: weeklyGoalProgress >= 100 ? "text-green-600" : "text-orange-600"
    },
    {
      title: "Study Streak",
      value: `${currentStreak}`,
      icon: BookOpen,
      description: currentStreak === 1 ? "day" : "days",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">
          You've completed <span className="font-semibold text-mint-600">{totalSessions}</span> study sessions. 
          Keep up the great work!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
