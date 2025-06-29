
import { useQuery } from '@tanstack/react-query';
import { openHolidaysService, type OpenHolidaysEvent } from '@/services/openHolidaysService';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCountries } from '@/hooks/useCountries';
import { useState, useEffect } from 'react';
import { fallbackCalendarData, getCurrentPeriod } from '@/data/academicCalendarFallback';

interface CalendarEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  type: 'holiday' | 'school' | 'term' | 'exam';
  category: 'public' | 'academic';
  isMultiDay: boolean;
}

const useGeolocation = () => {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        console.log('Detecting country via IP...');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('IP detection result:', data);
        if (data.country_code) {
          console.log('Country detected:', data.country_code);
          setCountryCode(data.country_code);
        }
      } catch (error) {
        console.error('Failed to detect country:', error);
        setCountryCode('US');
      }
    };

    detectCountry();
  }, []);

  return countryCode;
};

export const useSimplifiedAcademicCalendar = () => {
  const { userProfile } = useRequireAuth();
  const { userCountry } = useCountries();
  const detectedCountryCode = useGeolocation();
  
  const resolvedCountryCode = userCountry?.code || detectedCountryCode || 'US';
  const currentYear = new Date().getFullYear();

  console.log('Academic Calendar - Resolved country code:', resolvedCountryCode);

  // Get fallback data immediately
  const getFallbackEvents = (): CalendarEvent[] => {
    const fallbackData = fallbackCalendarData[resolvedCountryCode] || fallbackCalendarData['US'] || [];
    console.log(`Using fallback data for ${resolvedCountryCode}:`, fallbackData.length, 'events');
    return fallbackData;
  };

  // Always start with fallback data
  const fallbackEvents = getFallbackEvents();

  // Fetch public holidays (optional, runs in background)
  const { data: publicHolidays, isLoading: holidaysLoading, error: holidaysError } = useQuery({
    queryKey: ['public-holidays', resolvedCountryCode, currentYear],
    queryFn: async () => {
      console.log('Fetching public holidays for:', resolvedCountryCode);
      try {
        const result = await openHolidaysService.getPublicHolidays(resolvedCountryCode, currentYear);
        console.log('Public holidays result:', result);
        return result;
      } catch (error) {
        console.error('Public holidays error:', error);
        throw error;
      }
    },
    enabled: !!resolvedCountryCode,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Only retry once
  });

  // Fetch school holidays (optional, runs in background)
  const { data: schoolHolidays, isLoading: schoolLoading, error: schoolError } = useQuery({
    queryKey: ['school-holidays', resolvedCountryCode, currentYear],
    queryFn: async () => {
      console.log('Fetching school holidays for:', resolvedCountryCode);
      try {
        const result = await openHolidaysService.getSchoolHolidays(resolvedCountryCode, currentYear);
        console.log('School holidays result:', result);
        return result;
      } catch (error) {
        console.error('School holidays error:', error);
        throw error;
      }
    },
    enabled: !!resolvedCountryCode,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1, // Only retry once
  });

  // Transform API data to our format
  const transformEvents = (events: OpenHolidaysEvent[], category: 'public' | 'academic'): CalendarEvent[] => {
    if (!events || events.length === 0) return [];

    return events.map(event => ({
      id: event.id,
      name: openHolidaysService.getLocalizedName(event.name),
      date: event.startDate,
      endDate: event.endDate,
      type: category === 'public' ? 'holiday' : 
            event.name.some(n => n.text.toLowerCase().includes('exam')) ? 'exam' :
            event.name.some(n => n.text.toLowerCase().includes('term')) ? 'term' : 'school',
      category,
      isMultiDay: !!event.endDate && event.endDate !== event.startDate
    }));
  };

  // Combine API data with fallback data (API enhances fallback, doesn't replace it)
  const allEvents = (() => {
    const apiEvents = [
      ...transformEvents(publicHolidays || [], 'public'),
      ...transformEvents(schoolHolidays || [], 'academic')
    ];

    // If we have API data, merge it with fallback data (API takes precedence for duplicates)
    if (apiEvents.length > 0) {
      console.log('Merging API events with fallback data');
      // For now, just use API data if available, otherwise fallback
      return apiEvents;
    }

    // Always return fallback data
    console.log('Using fallback data only');
    return fallbackEvents;
  })();

  console.log('Final events count:', allEvents.length);

  // Get upcoming events
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
    
    console.log('Upcoming events:', upcoming.length);
    return upcoming;
  };

  // Get current status
  const getCurrentStatus = (): string => {
    if (allEvents.length === 0) return 'No calendar data available';
    
    const status = getCurrentPeriod(allEvents);
    console.log('Current status:', status);
    return status;
  };

  // Get next event
  const getNextEvent = (): CalendarEvent | null => {
    const today = new Date().toISOString().split('T')[0];
    const nextEvent = allEvents
      .filter(event => event.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    
    console.log('Next event:', nextEvent?.name || 'None');
    return nextEvent || null;
  };

  // Calculate days until next event
  const getDaysUntilNext = (): number => {
    const nextEvent = getNextEvent();
    if (!nextEvent) return 0;
    
    const today = new Date();
    const eventDate = new Date(nextEvent.date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getCountryName = async () => {
    try {
      const countries = await openHolidaysService.getCountries();
      const country = countries.find(c => c.isoCode === resolvedCountryCode);
      return country ? openHolidaysService.getLocalizedName(country.name) : resolvedCountryCode;
    } catch {
      return resolvedCountryCode;
    }
  };

  // Only show loading if we're actively fetching and have no fallback data
  const isLoading = (holidaysLoading || schoolLoading) && allEvents.length === 0;
  
  // Show error only if both APIs failed and we have fallback data
  const hasError = (!!holidaysError && !!schoolError) && allEvents.length > 0;

  return {
    events: allEvents,
    upcomingEvents: getUpcomingEvents(),
    currentStatus: getCurrentStatus(),
    nextEvent: getNextEvent(),
    daysUntilNext: getDaysUntilNext(),
    isLoading,
    hasError,
    formatDate,
    countryCode: resolvedCountryCode,
    getCountryName
  };
};
