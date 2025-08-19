-- Add show_video field to help_topics table
ALTER TABLE public.help_topics 
ADD COLUMN show_video boolean NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.help_topics.show_video IS 'Controls whether video content is visible for this help topic. Only admins can control this setting.';