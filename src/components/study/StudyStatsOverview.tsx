import { useStudySessions } from '@/hooks/useStudySessions';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatDuration } from '@/utils/formatTime';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, BookOpen, Flame, Settings, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const StudyStatsOverview = () => {
  const { isLoading, getSessionStatistics } = useStudySessions();
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      
      {/* Weekly Goal Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Weekly Study Goal</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {stats.totalHours} / {weeklyGoalHours} hours
            </div>
            <div className="text-sm text-blue-700">
              ({Math.round((stats.totalHours / weeklyGoalHours) * 100)}% complete)
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change your weekly study goal in Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <Settings className="h-4 w-4 mr-1" />
              Change Goal
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((stats.totalHours / weeklyGoalHours) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
