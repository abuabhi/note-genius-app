
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange, Event, UpcomingGoal } from "./types";
import { startOfDay, endOfDay, addDays, format } from "date-fns";
import { PostgrestError } from "@supabase/supabase-js";

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
        // Make sure we're throwing a PostgrestError or at least something that looks like it
        if (err instanceof Error && 'code' in err) {
          throw err; // This is already a PostgrestError
        }
        // Create a PostgrestError-like object to maintain type compatibility
        const pgError: PostgrestError = {
          message: err instanceof Error ? err.message : 'Unknown error fetching events',
          details: '',
          hint: '',
          code: 'CUSTOM_ERROR',
          name: 'PostgrestError'  // Add the missing 'name' property
        };
        throw pgError;
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
          throw error;
        }
        return data as Event[];
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        return []; 
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching study goals due in the next 7 days
 */
export const useUpcomingGoalsQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['upcomingGoals', userId],
    queryFn: async () => {
      if (!userId) return [] as UpcomingGoal[];

      const today = format(new Date(), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');

      try {
        const { data, error } = await supabase
          .from('study_goals')
          .select('id, title, description, end_date, status, is_completed')
          .eq('user_id', userId)
          .gte('end_date', today)
          .lte('end_date', nextWeek)
          .order('end_date', { ascending: true });

        if (error) throw error;
        return (data || [])
          .filter((g: any) => g.status !== 'completed' && !g.is_completed)
          .map((g: any) => ({
            id: g.id,
            title: g.title,
            description: g.description ?? null,
            end_date: g.end_date,
          })) as UpcomingGoal[];
      } catch (err) {
        console.error('Error fetching upcoming goals:', err);
        return [] as UpcomingGoal[];
      }
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
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
          throw error;
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
