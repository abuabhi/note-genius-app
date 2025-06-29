
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface AcademicEvent {
  name: string;
  date?: string;
  start?: string;
  end?: string;
}

interface AcademicCalendarData {
  terms: AcademicEvent[];
  holidays: AcademicEvent[];
  exam_periods: AcademicEvent[];
}

interface UserAcademicPreferences {
  country_code: string;
  state_region?: string;
  institution_type: string;
  academic_year?: string;
}

export const useAcademicCalendar = () => {
  const { user } = useRequireAuth();

  // Fetch user's academic preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['user-academic-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_academic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserAcademicPreferences | null;
    },
    enabled: !!user?.id
  });

  // Fetch academic calendar data based on preferences
  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['academic-calendar', userPreferences?.country_code, userPreferences?.institution_type],
    queryFn: async () => {
      const countryCode = userPreferences?.country_code || 'US';
      const institutionType = userPreferences?.institution_type || 'university';
      
      const { data, error } = await supabase
        .from('academic_calendars')
        .select('*')
        .eq('country_code', countryCode)
        .eq('institution_type', institutionType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: true
  });

  // Parse calendar data
  const parsedCalendarData = calendarData?.calendar_data as AcademicCalendarData | null;

  // Get current status and upcoming events
  const getCurrentStatus = () => {
    if (!parsedCalendarData) return 'No calendar data';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check if we're in a term
    for (const term of parsedCalendarData.terms) {
      if (term.start && term.end && todayStr >= term.start && todayStr <= term.end) {
        return `${term.name}`;
      }
    }

    // Check if we're in exam period
    for (const exam of parsedCalendarData.exam_periods) {
      if (exam.start && exam.end && todayStr >= exam.start && todayStr <= exam.end) {
        return `${exam.name}`;
      }
    }

    // Check if we're in a holiday
    for (const holiday of parsedCalendarData.holidays) {
      if (holiday.date && todayStr === holiday.date) {
        return `${holiday.name}`;
      }
      if (holiday.start && holiday.end && todayStr >= holiday.start && todayStr <= holiday.end) {
        return `${holiday.name}`;
      }
    }

    return 'Between Terms';
  };

  // Get next 2-3 upcoming events
  const getUpcomingEvents = () => {
    if (!parsedCalendarData) return [];
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const upcomingEvents: Array<{ name: string; date: string; type: string }> = [];

    // Add upcoming holidays
    parsedCalendarData.holidays.forEach(holiday => {
      const eventDate = holiday.date || holiday.start;
      if (eventDate && eventDate > todayStr) {
        upcomingEvents.push({
          name: holiday.name,
          date: eventDate,
          type: 'holiday'
        });
      }
    });

    // Add upcoming terms
    parsedCalendarData.terms.forEach(term => {
      if (term.start && term.start > todayStr) {
        upcomingEvents.push({
          name: `${term.name} starts`,
          date: term.start,
          type: 'term'
        });
      }
      if (term.end && term.end > todayStr) {
        upcomingEvents.push({
          name: `${term.name} ends`,
          date: term.end,
          type: 'term'
        });
      }
    });

    // Add upcoming exams
    parsedCalendarData.exam_periods.forEach(exam => {
      if (exam.start && exam.start > todayStr) {
        upcomingEvents.push({
          name: exam.name,
          date: exam.start,
          type: 'exam'
        });
      }
    });

    // Sort by date and take first 3
    return upcomingEvents
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return {
    userPreferences,
    calendarData: parsedCalendarData,
    isLoading,
    currentStatus: getCurrentStatus(),
    upcomingEvents: getUpcomingEvents(),
    formatDate,
    countryCode: userPreferences?.country_code || 'US',
    institutionType: userPreferences?.institution_type || 'University'
  };
};
