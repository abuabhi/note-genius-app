
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const StudyConsistency = () => {
  const { user } = useAuth();

  const { data: studyDates = [], isLoading } = useQuery({
    queryKey: ['study-consistency', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get the last 30 days of study activity
      const { data: progressData, error } = await supabase
        .from('user_flashcard_progress')
        .select('last_reviewed_at')
        .eq('user_id', user.id)
        .not('last_reviewed_at', 'is', null)
        .gte('last_reviewed_at', subDays(new Date(), 30).toISOString())
        .order('last_reviewed_at', { ascending: false });

      if (error) {
        console.error('Error fetching study dates:', error);
        return [];
      }

      // Extract unique dates
      const uniqueDates = Array.from(
        new Set(
          progressData.map(item => 
            format(new Date(item.last_reviewed_at), 'yyyy-MM-dd')
          )
        )
      );

      return uniqueDates;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      const hasActivity = studyDates.includes(dateString);
      
      days.push({
        date: dateString,
        displayDate: format(date, 'MMM d'),
        hasActivity
      });
    }
    return days;
  };

  const days = getLast30Days();

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Your Study Consistency</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="flex flex-wrap">
            {Array(30).fill(0).map((_, i) => (
              <div key={i} className="m-0.5 w-6 h-6 rounded-sm bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-xl cursor-help">Your Study Consistency</CardTitle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Visual representation of your daily study activity over the last 30 days. Darker squares indicate study activity.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-2">
        <TooltipProvider>
          <div className="flex flex-wrap">
            {days.map((day, i) => {
              const bgColor = day.hasActivity ? "bg-green-400" : "bg-gray-100";
              
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="m-0.5 w-6 h-6 rounded-sm cursor-pointer">
                      <div className={`w-full h-full ${bgColor} rounded-sm`}></div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{day.displayDate}: {day.hasActivity ? "Studied" : "No activity"}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        {days.every(day => !day.hasActivity) && (
          <div className="mt-4 text-center text-muted-foreground">
            <p className="text-sm">Start studying to build your consistency streak!</p>
            <p className="text-xs mt-1">Your activity will appear here as you review flashcards.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyConsistency;
