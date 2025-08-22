import { useMemo } from 'react';
import { useCleanSessionAnalytics } from './useCleanSessionAnalytics';
import { format, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';

interface ChartDataPoint {
  date: string;
  sessions: number;
  studyTime: number;
  avgSessionTime: number;
  manualSessions: number;
  movingAvg?: number;
}

interface UseStudySessionChartDataReturn {
  chartData: ChartDataPoint[];
  totalSessions: number;
  totalHours: number;
  avgSessionTime: number;
  isLoading: boolean;
}

export const useStudySessionChartData = (
  dateRange: { start: Date; end: Date }
): UseStudySessionChartDataReturn => {
  const { sessions, isLoading } = useCleanSessionAnalytics();

  const chartData = useMemo(() => {
    if (!sessions.length) return [];

    // Filter sessions within date range
    const filteredSessions = sessions.filter(session => {
      if (!session.start_time) return false;
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: dateRange.start, end: dateRange.end });
    });

    // Generate all days in the date range
    const allDays = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

    // Group sessions by date
    const sessionsByDate = filteredSessions.reduce((acc, session) => {
      if (!session.start_time) return acc;
      
      const dateKey = format(new Date(session.start_time), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, typeof filteredSessions>);

    // Create chart data for each day
    const data = allDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const daySessions = sessionsByDate[dateKey] || [];
      const completedSessions = daySessions.filter(s => !s.is_active && s.duration);
      
      // Calculate metrics for the day
      const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60; // Convert seconds to minutes
      const studyTimeHours = Math.round((totalMinutes / 60) * 10) / 10; // Convert minutes to hours, round to 1 decimal
      const avgMinutes = completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0;
      
      // Count manual/offline sessions
      const manualSessions = daySessions.filter(s => 
        s.session_source === 'offline' || s.manual_entry_date
      ).length;

      return {
        date: dateKey,
        sessions: daySessions.length,
        studyTime: studyTimeHours,
        avgSessionTime: avgMinutes,
        manualSessions
      };
    });

    // Calculate 7-day moving average for study time
    const dataWithMovingAvg = data.map((point, index) => {
      const start = Math.max(0, index - 6);
      const slice = data.slice(start, index + 1);
      const movingAvg = slice.reduce((acc, p) => acc + p.studyTime, 0) / slice.length;
      
      return {
        ...point,
        movingAvg: Math.round(movingAvg * 10) / 10
      };
    });

    return dataWithMovingAvg;
  }, [sessions, dateRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!sessions.length) {
      return { totalSessions: 0, totalHours: 0, avgSessionTime: 0 };
    }

    // Filter sessions within date range
    const filteredSessions = sessions.filter(session => {
      if (!session.start_time) return false;
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: dateRange.start, end: dateRange.end });
    });

    const completedSessions = filteredSessions.filter(s => !s.is_active && s.duration);
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60; // Convert seconds to minutes
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // Convert minutes to hours
    const avgSessionTime = completedSessions.length > 0 
      ? Math.round(totalMinutes / completedSessions.length) // Average minutes per session
      : 0;

    return {
      totalSessions: filteredSessions.length,
      totalHours,
      avgSessionTime
    };
  }, [sessions, dateRange]);

  return {
    chartData,
    totalSessions: summaryStats.totalSessions,
    totalHours: summaryStats.totalHours,
    avgSessionTime: summaryStats.avgSessionTime,
    isLoading
  };
};