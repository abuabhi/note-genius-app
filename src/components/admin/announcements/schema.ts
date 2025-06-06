
import * as z from "zod";

export const announcementFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  is_active: z.boolean().default(false),
  start_date: z.string(), // Changed from z.date() to z.string()
  end_date: z.string(),   // Changed from z.date() to z.string()
  background_color: z.string().default("#14b8a6"), // Default to mint-600 (matches the button green)
  text_color: z.string().default("#ffffff"),
  text_align: z.enum(["left", "center", "right"]).default("center"),
  mobile_layout: z.enum(["default", "condensed", "expanded"]).default("default"),
  target_tier: z.string().nullable().optional(),
  target_pages: z.string().default('["all"]'), // Store as JSON string
  dismissible: z.boolean().default(true),
  cta_text: z.string().nullable().optional(),
  cta_url: z.string().nullable().optional(),
})
.refine(data => {
  // Custom validation for date strings
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});
