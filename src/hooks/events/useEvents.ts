
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek } from "date-fns";
import { DateRange, UseEventsReturn } from "./types";
import { formatEventDate } from "./eventUtils";
import { useEventQuery, useUpcomingEventsQuery, useUpcomingGoalsQuery, useDueFlashcardsQuery } from "./useEventQueries";
import { useCreateEvent, useDeleteEvent } from "./useEventMutations";
import { PostgrestError } from "@supabase/supabase-js";

const getVisibleCalendarRange = (date: Date): DateRange => ({
  start: startOfWeek(startOfMonth(date)),
  end: endOfWeek(endOfMonth(date)),
});

/**
 * Main hook for events management
 */
export const useEvents = (currentDate: Date = new Date()): UseEventsReturn => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(() => getVisibleCalendarRange(currentDate));

  // Update date range when current date changes
  useEffect(() => {
    setDateRange(getVisibleCalendarRange(currentDate));
  }, [currentDate]);

  // Use the query hooks
  const { 
    data: events = [], 
    isLoading, 
    error, 
    refetch: refetchEvents 
  } = useEventQuery(user?.id, dateRange);
  
  const { 
    data: upcomingEvents = [], 
    isLoading: upcomingLoading, 
    refetch: refetchUpcomingEvents 
  } = useUpcomingEventsQuery(user?.id);

  const {
    data: upcomingGoals = [],
    isLoading: upcomingGoalsLoading,
    refetch: refetchUpcomingGoals,
  } = useUpcomingGoalsQuery(user?.id);

  const { data: dueFlashcards = [] } = useDueFlashcardsQuery(user?.id, dateRange);

  // Use the mutation hooks
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  // Load next/previous month events
  const loadAdjacentMonth = async (direction: 'next' | 'prev') => {
    const newDate = direction === 'next' ? 
      addMonths(currentDate, 1) : 
      addMonths(currentDate, -1);
    
    setDateRange(getVisibleCalendarRange(newDate));
  };

  return {
    events,
    upcomingEvents,
    upcomingGoals,
    upcomingLoading: upcomingLoading || upcomingGoalsLoading,
    dueFlashcards,
    isLoading,
    error: error as PostgrestError | null, // Ensure correct type is returned
    createEvent,
    deleteEvent,
    loadAdjacentMonth,
    updateDateRange: setDateRange,
    refetchEvents,
    refetchUpcomingEvents,
    refetchUpcomingGoals,
    formatEventDate,
  };
};
