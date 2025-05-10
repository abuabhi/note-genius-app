
import { format } from "date-fns";

/**
 * Format event date for display
 */
export const formatEventDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    return 'Invalid date';
  }
};
