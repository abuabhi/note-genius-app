
import { z } from "zod";

export const settingsFormSchema = z.object({
  email: z.string().email().optional(),
  emailNotifications: z.boolean().default(true),
  studyReminders: z.boolean().default(true),
  language: z.string().default("en"),
  countryId: z.string().optional(),
  darkMode: z.boolean().default(false),
  // Additional fields for extended form
  whatsappNotifications: z.boolean().default(false),
  whatsappPhone: z.string().optional(),
  goalNotifications: z.boolean().default(true),
  weeklyReports: z.boolean().default(false),
  dndEnabled: z.boolean().default(false),
  dndStartTime: z.string().default("22:00"),
  dndEndTime: z.string().default("07:00"),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
