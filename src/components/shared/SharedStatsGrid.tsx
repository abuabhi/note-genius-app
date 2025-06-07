
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Target, TrendingUp, Award, CheckCircle, Calendar, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsGridProps {
  stats: {
    totalHours: number;
    averageDuration: number;
    totalSessions: number;
    activeSessions: number;
    streakDays: number;
    totalCardsMastered: number;
    cardsReviewedToday: number;
    todayStudyMinutes: number;
  };
  isLoading?: boolean;
  variant?: 'dashboard' | 'progress' | 'sessions';
}

export const SharedStatsGrid = ({ stats, isLoading, variant = 'dashboard' }: StatsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
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

  // Define stats based on variant
  const getStatsConfig = () => {
    const baseStats = [
      {
        title: "Total Sessions",
        value: stats.totalSessions.toString(),
        icon: Calendar,
        description: "Study sessions completed",
        color: "text-blue-600"
      },
      {
        title: "Total Study Time", 
        value: formatTime(stats.todayStudyMinutes > 0 ? stats.todayStudyMinutes * stats.totalSessions : stats.totalHours * 60),
        icon: Clock,
        description: "Time spent learning",
        color: "text-green-600"
      },
      {
        title: "Average Session",
        value: `${stats.averageDuration}m`,
        icon: Timer,
        description: "Per session duration",
        color: "text-purple-600"
      },
      {
        title: "Cards Mastered",
        value: stats.totalCardsMastered.toString(),
        icon: Award,
        description: "Flashcards learned",
        color: "text-orange-600"
      }
    ];

    if (variant === 'dashboard') {
      return [
        {
          title: "Today's Study",
          value: formatTime(stats.todayStudyMinutes),
          icon: Clock,
          description: "Minutes studied today",
          color: "text-blue-600"
        },
        ...baseStats.slice(0, 3)
      ];
    }

    return baseStats;
  };

  const statsConfig = getStatsConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
