
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
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Export the schemas for use in other components
export const reminderSchemas = {
  status: reminderStatusSchema,
  type: reminderTypeSchema,
  recurrence: reminderRecurrenceSchema,
  deliveryMethod: deliveryMethodSchema
};
