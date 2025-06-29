
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
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
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

  // Fetch public holidays
  const { data: publicHolidays, isLoading: holidaysLoading, error: holidaysError } = useQuery({
    queryKey: ['public-holidays', resolvedCountryCode, currentYear],
    queryFn: () => openHolidaysService.getPublicHolidays(resolvedCountryCode, currentYear),
    enabled: !!resolvedCountryCode,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch school holidays
  const { data: schoolHolidays, isLoading: schoolLoading, error: schoolError } = useQuery({
    queryKey: ['school-holidays', resolvedCountryCode, currentYear],
    queryFn: () => openHolidaysService.getSchoolHolidays(resolvedCountryCode, currentYear),
    enabled: !!resolvedCountryCode,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Transform API data to our format
  const transformEvents = (events: OpenHolidaysEvent[], category: 'public' | 'academic'): CalendarEvent[] => {
    if (!events) return [];

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

  // Get fallback data if API fails
  const getFallbackEvents = (): CalendarEvent[] => {
    return fallbackCalendarData[resolvedCountryCode] || fallbackCalendarData['US'] || [];
  };

  // Combine API data with fallback data
  const allEvents = (() => {
    const apiEvents = [
      ...transformEvents(publicHolidays || [], 'public'),
      ...transformEvents(schoolHolidays || [], 'academic')
    ];

    // Use API data if available, otherwise use fallback data
    if (apiEvents.length > 0) {
      return apiEvents;
    }

    // If API failed or returned no data, use fallback
    if (holidaysError || schoolError) {
      console.log('Using fallback data due to API errors');
      return getFallbackEvents();
    }

    return apiEvents;
  })();

  // Get upcoming events
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  };

  // Get current status without complex progress calculation
  const getCurrentStatus = (): string => {
    if (allEvents.length === 0) return 'Loading calendar data...';
    return getCurrentPeriod(allEvents);
  };

  // Get next event
  const getNextEvent = (): CalendarEvent | null => {
    const today = new Date().toISOString().split('T')[0];
    const nextEvent = allEvents
      .filter(event => event.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    
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

  return {
    events: allEvents,
    upcomingEvents: getUpcomingEvents(),
    currentStatus: getCurrentStatus(),
    nextEvent: getNextEvent(),
    daysUntilNext: getDaysUntilNext(),
    isLoading: holidaysLoading || schoolLoading,
    hasError: !!holidaysError || !!schoolError,
    formatDate,
    countryCode: resolvedCountryCode,
    getCountryName
  };
};
