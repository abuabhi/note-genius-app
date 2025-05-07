
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudySessions } from "@/hooks/useStudySessions";
import { formatDuration } from "@/utils/formatTime";
import { Clock, Calendar, Book } from "lucide-react";

export const StudyStatsOverview = () => {
  const { sessions, isLoading, getSessionStatistics } = useStudySessions();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const stats = getSessionStatistics();
  
  // Calculate weekly stats
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const weeklyStats = sessions.filter(session => 
    new Date(session.start_time) >= thisWeekStart
  );
  
  const weeklyTotalTime = weeklyStats.reduce((acc, session) => 
    acc + (session.duration || 0), 0);
    
  // Calculate monthly stats
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyStats = sessions.filter(session => 
    new Date(session.start_time) >= thisMonthStart
  );
  
  const monthlyTotalTime = monthlyStats.reduce((acc, session) => 
    acc + (session.duration || 0), 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className="text-2xl font-bold">
              {formatDuration(stats.totalStudyTime)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {stats.totalSessions} sessions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span className="text-2xl font-bold">
              {formatDuration(weeklyTotalTime)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {weeklyStats.length} sessions this week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Book className="h-4 w-4 mr-2 text-primary" />
            <span className="text-2xl font-bold">
              {formatDuration(monthlyTotalTime)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {monthlyStats.length} sessions this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
