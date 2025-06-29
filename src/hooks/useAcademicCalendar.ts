import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCountries } from '@/hooks/useCountries';
import { useState, useEffect } from 'react';

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

// Geolocation detection hook
const useGeolocation = () => {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to get location from IP
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          setCountryCode(data.country_code);
        }
      } catch (error) {
        console.error('Failed to detect country:', error);
        setCountryCode('US'); // Fallback to US
      }
    };

    detectCountry();
  }, []);

  return countryCode;
};

export const useAcademicCalendar = () => {
  const { user, userProfile } = useRequireAuth();
  const { countries, userCountry } = useCountries();
  const detectedCountryCode = useGeolocation();

  // Fetch user's academic preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
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

  // Determine country code priority: user preferences > user profile > geolocation > default
  const resolvedCountryCode = userPreferences?.country_code || 
                             userCountry?.code || 
                             detectedCountryCode || 
                             'US';

  // Auto-create user preferences if they don't exist and we have a resolved country
  useEffect(() => {
    const createPreferences = async () => {
      if (user?.id && !userPreferences && !preferencesLoading && resolvedCountryCode) {
        try {
          await supabase
            .from('user_academic_preferences')
            .insert({
              user_id: user.id,
              country_code: resolvedCountryCode,
              institution_type: 'university'
            });
        } catch (error) {
          console.error('Failed to create academic preferences:', error);
        }
      }
    };

    createPreferences();
  }, [user?.id, userPreferences, preferencesLoading, resolvedCountryCode]);

  // Fetch academic calendar data based on resolved country
  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['academic-calendar', resolvedCountryCode, userPreferences?.institution_type || 'university'],
    queryFn: async () => {
      const institutionType = userPreferences?.institution_type || 'university';
      
      const { data, error } = await supabase
        .from('academic_calendars')
        .select('*')
        .eq('country_code', resolvedCountryCode)
        .eq('institution_type', institutionType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!resolvedCountryCode
  });

  // Parse calendar data with proper type checking
  const parsedCalendarData = (() => {
    if (!calendarData?.calendar_data) return null;
    
    try {
      const data = calendarData.calendar_data as unknown;
      
      // Type guard to ensure the data structure is correct
      if (typeof data === 'object' && data !== null) {
        const calendarObj = data as Record<string, unknown>;
        
        if (Array.isArray(calendarObj.terms) && 
            Array.isArray(calendarObj.holidays) && 
            Array.isArray(calendarObj.exam_periods)) {
          return data as AcademicCalendarData;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to parse calendar data:', error);
      return null;
    }
  })();

  const getCurrentStatus = () => {
    if (!parsedCalendarData) return 'No calendar data available';
    
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

  const getCountryName = () => {
    const country = countries.find(c => c.code === resolvedCountryCode);
    return country?.name || resolvedCountryCode;
  };

  return {
    userPreferences,
    calendarData: parsedCalendarData,
    isLoading: preferencesLoading || calendarLoading,
    currentStatus: getCurrentStatus(),
    upcomingEvents: getUpcomingEvents(),
    formatDate,
    countryCode: resolvedCountryCode,
    countryName: getCountryName(),
    institutionType: userPreferences?.institution_type || 'University',
    countries,
    userCountry
  };
};
