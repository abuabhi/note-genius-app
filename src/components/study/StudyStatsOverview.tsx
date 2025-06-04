
import { useStudySessions } from '@/hooks/useStudySessions';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatDuration } from '@/utils/formatTime';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, BookOpen, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

export const StudyStatsOverview = () => {
  const { isLoading, getSessionStatistics } = useStudySessions();
  const { user } = useAuth();
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(5);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  
  const stats = getSessionStatistics ? getSessionStatistics() : {
    totalHours: 0,
    averageDuration: 0,
    totalSessions: 0,
    activeSessions: 0
  };

  // Fetch user's weekly study goal preference
  useEffect(() => {
    const fetchWeeklyGoal = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('weekly_study_goal_hours')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data && data.weekly_study_goal_hours) {
          setWeeklyGoalHours(data.weekly_study_goal_hours);
        }
      } catch (error) {
        console.error("Error fetching weekly goal:", error);
        // Keep default value of 5 hours
      } finally {
        setIsLoadingGoal(false);
      }
    };
    
    fetchWeeklyGoal();
  }, [user]);

  if (isLoading || isLoadingGoal) {
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

  const statItems = [
    {
      label: "Total Study Hours",
      value: `${stats.totalHours} hours`,
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      label: "Average Session",
      value: formatDuration(stats.averageDuration),
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
    {
      label: "Total Sessions",
      value: stats.totalSessions,
      icon: <Calendar className="h-6 w-6 text-mint-500" />,
      bgColor: "bg-mint-50",
      borderColor: "border-mint-100",
    },
    {
      label: "Active Sessions",
      value: stats.activeSessions,
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div 
          key={index} 
          className={`bg-white/70 backdrop-blur-sm rounded-xl border ${item.borderColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <div className={`inline-flex items-center justify-center p-3 rounded-lg ${item.bgColor} mb-4`}>
            {item.icon}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
