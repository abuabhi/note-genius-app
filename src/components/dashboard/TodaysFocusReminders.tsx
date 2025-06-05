
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminder_time?: string;
  type: string;
}

interface TodaysFocusRemindersProps {
  reminders: Reminder[];
}

export const TodaysFocusReminders = ({ reminders }: TodaysFocusRemindersProps) => {
  if (reminders.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-gray-800">Due Today</span>
      </div>
      <div className="space-y-2">
        {reminders.slice(0, 3).map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between bg-purple-50 rounded p-3">
            <div>
              <div className="font-medium text-purple-800">{reminder.title}</div>
              {reminder.description && (
                <div className="text-sm text-purple-600">{reminder.description}</div>
              )}
              <div className="text-xs text-purple-500 mt-1">
                {reminder.reminder_time ? (
                  `Due at ${new Date(reminder.reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                ) : (
                  'Due today'
                )}
              </div>
            </div>
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              {reminder.type}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
