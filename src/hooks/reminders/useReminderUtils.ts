
import { addDays, addWeeks, addMonths, format } from "date-fns";

export const useReminderUtils = () => {
  // Generate the next recurring date based on recurrence pattern
  const getNextRecurrenceDate = (date: Date, recurrence: string): Date => {
    switch (recurrence) {
      case 'daily':
        return addDays(date, 1);
      case 'weekly':
        return addWeeks(date, 1);
      case 'monthly':
        return addMonths(date, 1);
      default:
        return date;
    }
  };

  // Helper function to format reminder date
  const formatReminderTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  return {
    getNextRecurrenceDate,
    formatReminderTime
  };
};
