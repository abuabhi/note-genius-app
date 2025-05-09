
import { useStudySessions } from '@/hooks/useStudySessions';
import { formatDuration } from '@/utils/formatTime';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, BookOpen, Flame } from 'lucide-react';

export const StudyStatsOverview = () => {
  const { isLoading, getSessionStatistics } = useStudySessions();
  
  const stats = getSessionStatistics ? getSessionStatistics() : {
    totalHours: 0,
    averageDuration: 0,
    totalSessions: 0,
    activeSessions: 0
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Study Hours",
      value: `${stats.totalHours} hours`,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
    },
    {
      label: "Average Session",
      value: formatDuration(stats.averageDuration),
      icon: <Flame className="h-5 w-5 text-orange-500" />,
    },
    {
      label: "Total Sessions",
      value: stats.totalSessions,
      icon: <Calendar className="h-5 w-5 text-green-500" />,
    },
    {
      label: "Active Sessions",
      value: stats.activeSessions,
      icon: <BookOpen className="h-5 w-5 text-purple-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </div>
          <div className="text-2xl font-bold">{item.value}</div>
        </Card>
      ))}
    </div>
  );
};
