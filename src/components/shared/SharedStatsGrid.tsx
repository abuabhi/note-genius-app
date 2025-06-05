
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Calendar, BookOpen, Flame, Target, TrendingUp } from 'lucide-react';
import { formatDuration } from '@/utils/formatTime';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  tooltip: string;
}

interface SharedStatsGridProps {
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
  isLoading: boolean;
  variant?: 'dashboard' | 'overview' | 'detailed';
}

export const SharedStatsGrid = ({ stats, isLoading, variant = 'overview' }: SharedStatsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <Skeleton className="h-4 w-20 mb-3 bg-mint-100" />
            <Skeleton className="h-8 w-20 bg-mint-200" />
          </div>
        ))}
      </div>
    );
  }

  const getStatItems = (): StatItem[] => {
    const baseStats: StatItem[] = [
      {
        label: "Total Study Hours",
        value: `${stats.totalHours} hours`,
        icon: <Clock className="h-6 w-6 text-blue-500" />,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-100",
        tooltip: "Total time spent in completed study sessions"
      },
      {
        label: "Average Session",
        value: formatDuration(stats.averageDuration),
        icon: <Flame className="h-6 w-6 text-orange-500" />,
        bgColor: "bg-orange-50",
        borderColor: "border-orange-100",
        tooltip: "Average duration of your study sessions"
      },
      {
        label: "Total Sessions",
        value: stats.totalSessions,
        icon: <Calendar className="h-6 w-6 text-mint-500" />,
        bgColor: "bg-mint-50",
        borderColor: "border-mint-100",
        tooltip: "Total number of study sessions created"
      },
      {
        label: "Active Sessions",
        value: stats.activeSessions,
        icon: <BookOpen className="h-6 w-6 text-purple-500" />,
        bgColor: "bg-purple-50",
        borderColor: "border-purple-100",
        tooltip: "Currently active study sessions"
      }
    ];

    if (variant === 'dashboard') {
      return [
        {
          label: "Study Streak",
          value: `${stats.streakDays} days`,
          icon: <Flame className="h-6 w-6 text-orange-500" />,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-100",
          tooltip: "Consecutive days with study activity"
        },
        {
          label: "Today's Study Time",
          value: `${stats.todayStudyMinutes}m`,
          icon: <Clock className="h-6 w-6 text-blue-500" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          tooltip: "Minutes studied today across all sessions"
        },
        {
          label: "Cards Mastered",
          value: stats.totalCardsMastered,
          icon: <Target className="h-6 w-6 text-green-500" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          tooltip: "Flashcards with high retention rate (well learned)"
        },
        {
          label: "Cards Today",
          value: stats.cardsReviewedToday,
          icon: <TrendingUp className="h-6 w-6 text-mint-500" />,
          bgColor: "bg-mint-50",
          borderColor: "border-mint-100",
          tooltip: "Flashcards reviewed today"
        }
      ];
    }

    if (variant === 'detailed') {
      return [
        ...baseStats,
        {
          label: "Study Streak",
          value: `${stats.streakDays} days`,
          icon: <Flame className="h-6 w-6 text-orange-500" />,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-100",
          tooltip: "Consecutive days with study activity"
        },
        {
          label: "Cards Mastered",
          value: stats.totalCardsMastered,
          icon: <Target className="h-6 w-6 text-green-500" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-100",
          tooltip: "Flashcards with high retention rate (well learned)"
        }
      ];
    }

    return baseStats;
  };

  const statItems = getStatItems();
  const gridCols = variant === 'detailed' ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <TooltipProvider>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6`}>
        {statItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div 
                className={`bg-white/70 backdrop-blur-sm rounded-xl border ${item.borderColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-help`}
              >
                <div className={`inline-flex items-center justify-center p-3 rounded-lg ${item.bgColor} mb-4`}>
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
