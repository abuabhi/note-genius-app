
import { z } from 'zod';

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  compact_text: z.string().optional(),
  cta_text: z.string().optional(),
  cta_url: z.string().url().optional().or(z.literal('')),
  background_color: z.string().min(1, 'Background color is required'),
  text_color: z.string().min(1, 'Text color is required'),
  is_active: z.boolean(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  target_tier: z.string(),
  target_pages: z.string(),
  mobile_layout: z.string(),
  priority: z.number().min(1).max(10),
  dismissible: z.boolean(),
});
