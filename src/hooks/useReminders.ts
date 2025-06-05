
import { useState } from "react";
import { useReminderQueries } from "./reminders/useReminderQueries";
import { useReminderMutations } from "./reminders/useReminderMutations";
import { useReminderUtils } from "./reminders/useReminderUtils";

// Re-export types for backward compatibility
export type {
  ReminderStatus,
  ReminderRecurrence,
  DeliveryMethod,
  ReminderType,
  Reminder,
  CreateReminderData,
  ReminderFormValues
} from "./reminders/types";

export const useReminders = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { reminders, remindersLoading } = useReminderQueries();
  const { createReminder, cancelReminder, dismissReminder } = useReminderMutations();
  const { getNextRecurrenceDate, formatReminderTime } = useReminderUtils();

  return {
    reminders,
    isLoading: isLoading || remindersLoading,
    createReminder,
    cancelReminder,
    dismissReminder,
    formatReminderTime,
    getNextRecurrenceDate
  };
};
