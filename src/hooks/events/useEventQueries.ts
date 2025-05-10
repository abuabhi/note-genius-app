
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange, Event } from "./types";
import { startOfDay, endOfDay, addDays } from "date-fns";

/**
 * Hook for fetching events for a specific date range
 */
export const useEventQuery = (userId: string | undefined, dateRange: DateRange) => {
  return useQuery({
    queryKey: ['events', userId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', dateRange.start.toISOString())
          .lte('start_time', dateRange.end.toISOString())
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        return data as Event[];
      } catch (err) {
        console.error('Error fetching events:', err);
        throw err;
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 10000,
    refetchOnWindowFocus: false
  });
};

/**
 * Hook for fetching upcoming events for the next 7 days
 */
export const useUpcomingEventsQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['upcomingEvents', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const today = startOfDay(new Date());
      const nextWeek = endOfDay(addDays(today, 7));
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', today.toISOString())
          .lte('start_time', nextWeek.toISOString())
          .order('start_time', { ascending: true });
        
        if (error) {
          console.error('Error fetching upcoming events:', error);
          return [];
        }
        return data as Event[];
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        return []; 
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true
  });
};

/**
 * Hook for fetching due flashcards
 */
export const useDueFlashcardsQuery = (userId: string | undefined, dateRange: DateRange) => {
  return useQuery({
    queryKey: ['dueFlashcards', userId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('user_flashcard_progress')
          .select(`
            id,
            flashcard_id,
            next_review_at,
            flashcards(front_content, back_content)
          `)
          .eq('user_id', userId)
          .gte('next_review_at', dateRange.start.toISOString())
          .lte('next_review_at', dateRange.end.toISOString());
        
        if (error) {
          console.error('Error fetching due flashcards:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Exception when fetching due flashcards:', err);
        return [];
      }
    },
    enabled: !!userId,
    retry: false,
    meta: {
      onError: (err: any) => {
        console.error('Query error when fetching due flashcards:', err);
      }
    }
  });
};
