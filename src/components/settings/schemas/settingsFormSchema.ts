
import { z } from "zod";

export const settingsFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  language: z.string().min(2, "Language is required"),
  countryId: z.string(),
  emailNotifications: z.boolean(),
  studyReminders: z.boolean(),
  darkMode: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
