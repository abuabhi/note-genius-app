
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { DateRange, UseEventsReturn } from "./types";
import { formatEventDate } from "./eventUtils";
import { useEventQuery, useUpcomingEventsQuery, useDueFlashcardsQuery } from "./useEventQueries";
import { useCreateEvent, useDeleteEvent } from "./useEventMutations";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Main hook for events management
 */
export const useEvents = (currentDate: Date = new Date()): UseEventsReturn => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  // Update date range when current date changes
  useEffect(() => {
    setDateRange({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
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
  
  const { data: dueFlashcards = [] } = useDueFlashcardsQuery(user?.id, dateRange);

  // Use the mutation hooks
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  // Load next/previous month events
  const loadAdjacentMonth = async (direction: 'next' | 'prev') => {
    const newDate = direction === 'next' ? 
      addMonths(currentDate, 1) : 
      addMonths(currentDate, -1);
    
    setDateRange({
      start: startOfMonth(newDate),
      end: endOfMonth(newDate)
    });
  };

  return {
    events,
    upcomingEvents,
    upcomingLoading,
    dueFlashcards,
    isLoading,
    error: error as PostgrestError | null, // Ensure correct type is returned
    createEvent,
    deleteEvent,
    loadAdjacentMonth,
    updateDateRange: setDateRange,
    refetchEvents,
    refetchUpcomingEvents,
    formatEventDate,
  };
};
