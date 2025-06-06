
import * as z from "zod";

export const announcementFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  is_active: z.boolean().default(false),
  start_date: z.date(),
  end_date: z.date(),
  background_color: z.string().default("#14b8a6"), // Default to mint-600
  text_color: z.string().default("#ffffff"),
  text_align: z.enum(["left", "center", "right"]).default("center"),
  mobile_layout: z.enum(["default", "condensed", "expanded"]).default("default"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  target_tier: z.string().nullable().optional(),
  target_pages: z.array(z.string()).default([]),
  dismissible: z.boolean().default(true),
  cta_text: z.string().nullable().optional(),
  cta_url: z.string().nullable().optional(),
})
.refine(data => data.end_date > data.start_date, {
  message: "End date must be after start date",
  path: ["end_date"],
});
