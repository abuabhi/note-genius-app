
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export type Event = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  event_type: string;
  is_recurring: boolean;
  recurrence_pattern: any | null;
  flashcard_set_id: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export const useEvents = (currentDate: Date = new Date()) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
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

  // Fetch events for the current month with improved error handling
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', user?.id, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', dateRange.start.toISOString())
          .lte('start_time', dateRange.end.toISOString())
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        return data as Event[];
      } catch (err) {
        console.error('Error fetching events:', err);
        throw err; // Re-throw for handling in the component
      }
    },
    enabled: !!user,
    retry: 1, // Only retry once to avoid too many error messages
    staleTime: 10000, // Cache data for 10 seconds
    refetchOnWindowFocus: false // Don't refetch when window gains focus
  });

  // Fetch due flashcards for this period with improved error handling
  const { data: dueFlashcards = [] } = useQuery({
    queryKey: ['dueFlashcards', user?.id, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('user_flashcard_progress')
          .select(`
            id,
            flashcard_id,
            next_review_at,
            flashcards(front_content, back_content)
          `)
          .eq('user_id', user.id)
          .gte('next_review_at', dateRange.start.toISOString())
          .lte('next_review_at', dateRange.end.toISOString());
        
        if (error) {
          console.error('Error fetching due flashcards:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error('Exception when fetching due flashcards:', err);
        return []; // Return empty array instead of throwing to avoid breaking UI
      }
    },
    enabled: !!user,
    retry: false,
    onError: (err) => {
      console.error('Query error when fetching due flashcards:', err);
      // Silent failure - we don't want to break the calendar if flashcards can't be loaded
    }
  });

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: async (newEvent: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const eventData = {
        ...newEvent,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create event');
      console.error('Error creating event:', error);
    }
  });

  // Delete event mutation
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  });

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
    dueFlashcards,
    isLoading,
    error,
    createEvent,
    deleteEvent,
    loadAdjacentMonth,
    updateDateRange: setDateRange,
  };
};
