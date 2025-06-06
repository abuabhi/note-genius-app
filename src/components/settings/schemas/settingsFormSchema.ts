
import { z } from "zod";

// Define string literal types for the schema
const reminderStatusSchema = z.enum(['pending', 'sent', 'dismissed']);
const reminderTypeSchema = z.enum(['study_event', 'goal_deadline', 'flashcard_review']);
const reminderRecurrenceSchema = z.enum(['none', 'daily', 'weekly', 'monthly']);
const deliveryMethodSchema = z.enum(['in_app', 'email', 'whatsapp']);

export const settingsFormSchema = z.object({
  email: z.string().email().optional(),
  language: z.string().default("en"),
  countryId: z.string().optional(),
  
  // Weekly study goal field
  weeklyStudyGoalHours: z.number().min(1).max(50).default(5),
  
  // Adaptive Learning Preferences
  adaptiveDifficulty: z.enum(['adaptive', 'challenging', 'comfortable']).default('adaptive'),
  studyStyle: z.enum(['intensive', 'distributed', 'mixed']).default('distributed'),
  preferredSessionLength: z.number().min(15).max(120).default(45),
  maxDailyStudyTime: z.number().min(60).max(480).default(180),
  breakFrequency: z.enum(['frequent', 'moderate', 'minimal']).default('moderate'),
  adaptationSensitivity: z.enum(['low', 'normal', 'high']).default('normal'),
  enableRealTimeAdaptations: z.boolean().default(true),
  enableLearningPaths: z.boolean().default(true),
  
  // Notification Preferences
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  adaptiveNotifications: z.boolean().default(true),
  studySessionReminders: z.boolean().default(true),
  goalDeadlineReminders: z.boolean().default(true),
  reminderFrequency: z.enum(['immediate', '15min', '30min', '1hour']).default('15min'),
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z.string().default('22:00'),
  quietHoursEnd: z.string().default('08:00'),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Export the schemas for use in other components
export const reminderSchemas = {
  status: reminderStatusSchema,
  type: reminderTypeSchema,
  recurrence: reminderRecurrenceSchema,
  deliveryMethod: deliveryMethodSchema
};
