
import { PostgrestError } from "@supabase/supabase-js";

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

export type DateRange = {
  start: Date;
  end: Date;
};

export interface UseEventsReturn {
  events: Event[];
  upcomingEvents: Event[];
  upcomingLoading: boolean;
  dueFlashcards: any[];
  isLoading: boolean;
  error: PostgrestError | null;
  createEvent: any;
  deleteEvent: any;
  loadAdjacentMonth: (direction: 'next' | 'prev') => Promise<void>;
  updateDateRange: (range: DateRange) => void;
  refetchEvents: () => void;
  refetchUpcomingEvents: () => void;
  formatEventDate: (dateString: string) => string;
}
