
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

// Helper to create a new event ID
export const createEventId = () => {
  return uuid();
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
