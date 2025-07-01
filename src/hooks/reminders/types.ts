export type ReminderStatus = 'pending' | 'sent' | 'cancelled';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type DeliveryMethod = 'in_app' | 'email' | 'whatsapp';
export type ReminderType = 'study_event' | 'goal_deadline' | 'flashcard_review' | 'study' | 'event' | 'goal' | 'todo' | 'other';

// Main Reminder interface that matches database reality
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string | null;
  type: string; // Accept any string from database
  status: string; // Accept any string from database
  event_id?: string;
  goal_id?: string;
  delivery_methods: string[]; // Accept any string array from database
  recurrence: string; // Accept any string from database
  created_at: string;
  updated_at: string;
  events?: any;
  goals?: any;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_time: Date;
  type: ReminderType;
  event_id?: string;
  goal_id?: string;
  delivery_methods: DeliveryMethod[];
  recurrence: ReminderRecurrence;
}

export interface ReminderFormValues {
  title: string;
  description?: string;
  reminder_time: string;
  type: ReminderType;
  event_id?: string;
  goal_id?: string;
  delivery_methods: DeliveryMethod[];
  recurrence: ReminderRecurrence;
}
