
import { EventInput } from '@fullcalendar/core';
import { v4 as uuid } from 'uuid';
import { startOfMonth, endOfMonth, addDays, format } from 'date-fns';

// Helper to create a new event ID
export const createEventId = () => {
  return uuid();
};

// Sample initial events for demo purposes
export const INITIAL_EVENTS: EventInput[] = [
  {
    id: createEventId(),
    title: 'Study Session',
    start: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
  },
  {
    id: createEventId(),
    title: 'Quiz Review',
    start: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
  }
];

// Get events for a specific date range
export const getEventsForDateRange = (start: Date, end: Date) => {
  // This would typically be a database query
  return INITIAL_EVENTS;
};

// Format datestring for display
export const formatEventDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    return 'Invalid date';
  }
};
