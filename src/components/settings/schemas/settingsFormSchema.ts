
import { z } from "zod";

// Define string literal types for the schema
const reminderStatusSchema = z.enum(['pending', 'sent', 'dismissed']);
const reminderTypeSchema = z.enum(['study_event', 'goal_deadline', 'flashcard_review']);
const reminderRecurrenceSchema = z.enum(['none', 'daily', 'weekly', 'monthly']);
const deliveryMethodSchema = z.enum(['in_app', 'email', 'whatsapp']);

export const settingsFormSchema = z.object({
  email: z.string().email().optional(),
  emailNotifications: z.boolean().default(true),
  studyReminders: z.boolean().default(true),
  language: z.string().default("en"),
  countryId: z.string().optional(),
  // Additional fields for extended form
  whatsappNotifications: z.boolean().default(false),
  whatsappPhone: z.string().optional(),
  goalNotifications: z.boolean().default(true),
  weeklyReports: z.boolean().default(false),
  // Weekly study goal field
  weeklyStudyGoalHours: z.number().min(1).max(50).default(5),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Export the schemas for use in other components
export const reminderSchemas = {
  status: reminderStatusSchema,
  type: reminderTypeSchema,
  recurrence: reminderRecurrenceSchema,
  deliveryMethod: deliveryMethodSchema
};
