
import { format, parseISO } from "date-fns";

export const useTodoUtils = () => {
  // Format date helper function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    try {
      return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  return {
    formatDate
  };
};
