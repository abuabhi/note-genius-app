
import { ScalableReminderPopover } from './ScalableReminderPopover';
import { useReminderToasts } from '@/hooks/useReminderToasts';

export const ReminderNavPopover = () => {
  // Mount reminder toasts globally in the navbar so they work across the app
  useReminderToasts();
  return <ScalableReminderPopover />;
};
