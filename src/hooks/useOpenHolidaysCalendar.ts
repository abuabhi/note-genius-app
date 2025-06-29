
import { useQuery } from '@tanstack/react-query';
import { openHolidaysService, type OpenHolidaysEvent } from '@/services/openHolidaysService';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCountries } from '@/hooks/useCountries';
import { useState, useEffect } from 'react';

interface CalendarEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  type: 'holiday' | 'school' | 'term' | 'exam';
  category: 'public' | 'academic';
  isMultiDay: boolean;
}

interface AcademicProgress {
  currentPeriod: string;
  periodProgress: number;
  yearProgress: number;
  daysUntilNext: number;
  nextEvent: CalendarEvent | null;
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

export const useOpenHolidaysCalendar = () => {
  const { userProfile } = useRequireAuth();
  const { userCountry } = useCountries();
  const detectedCountryCode = useGeolocation();
  
  const resolvedCountryCode = userCountry?.code || detectedCountryCode || 'US';
  const currentYear = new Date().getFullYear();

  // Fetch public holidays
  const { data: publicHolidays, isLoading: holidaysLoading } = useQuery({
    queryKey: ['public-holidays', resolvedCountryCode, currentYear],
    queryFn: () => openHolidaysService.getPublicHolidays(resolvedCountryCode, currentYear),
    enabled: !!resolvedCountryCode,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch school holidays
  const { data: schoolHolidays, isLoading: schoolLoading } = useQuery({
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

  const allEvents = [
    ...transformEvents(publicHolidays || [], 'public'),
    ...transformEvents(schoolHolidays || [], 'academic')
  ];

  // Get upcoming events
  const getUpcomingEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return allEvents
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  };

  // Calculate academic progress
  const getAcademicProgress = (): AcademicProgress => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Find current academic period
    const currentEvent = allEvents.find(event => 
      event.category === 'academic' && 
      event.date <= todayStr && 
      (event.endDate ? event.endDate >= todayStr : event.date === todayStr)
    );

    const nextEvent = allEvents
      .filter(event => event.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null;

    const daysUntilNext = nextEvent ? 
      Math.ceil((new Date(nextEvent.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate year progress (academic year typically starts in August/September)
    const academicYearStart = new Date(currentYear, 7, 1); // August 1st
    const academicYearEnd = new Date(currentYear + 1, 6, 30); // July 30th next year
    const yearProgress = Math.min(100, Math.max(0, 
      ((today.getTime() - academicYearStart.getTime()) / 
       (academicYearEnd.getTime() - academicYearStart.getTime())) * 100
    ));

    return {
      currentPeriod: currentEvent?.name || 'Between Terms',
      periodProgress: 65, // Mock progress for current period
      yearProgress: Math.round(yearProgress),
      daysUntilNext,
      nextEvent
    };
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
    academicProgress: getAcademicProgress(),
    isLoading: holidaysLoading || schoolLoading,
    formatDate,
    countryCode: resolvedCountryCode,
    getCountryName
  };
};
