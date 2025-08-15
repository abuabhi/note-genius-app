-- Create table to log each transcription
CREATE TABLE IF NOT EXISTS public.transcription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  video_id TEXT,
  title TEXT,
  provider TEXT NOT NULL DEFAULT 'gladia',
  source_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable RLS and allow only DEAN users to view
ALTER TABLE public.transcription_usage ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transcription_usage' AND policyname = 'DEAN can view transcription usage'
  ) THEN
    CREATE POLICY "DEAN can view transcription usage"
    ON public.transcription_usage
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.user_tier = 'DEAN'
      )
    );
  END IF;
END $$;

-- Create table to record sent alerts per milestone
CREATE TABLE IF NOT EXISTS public.transcription_usage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  email TEXT NOT NULL DEFAULT 'hello@prepgenie.io',
  notified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transcription_alerts_milestone 
  ON public.transcription_usage_alerts (milestone);

ALTER TABLE public.transcription_usage_alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transcription_usage_alerts' AND policyname = 'DEAN can view transcription alerts'
  ) THEN
    CREATE POLICY "DEAN can view transcription alerts"
    ON public.transcription_usage_alerts
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.user_tier = 'DEAN'
      )
    );
  END IF;
END $$;

-- Settings table to store alert email and an offset (to account for historical usage)
CREATE TABLE IF NOT EXISTS public.transcription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_email TEXT NOT NULL DEFAULT 'hello@prepgenie.io',
  offset INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transcription_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transcription_settings' AND policyname = 'DEAN can read settings'
  ) THEN
    CREATE POLICY "DEAN can read settings"
    ON public.transcription_settings
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.user_tier = 'DEAN'
      )
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transcription_settings' AND policyname = 'DEAN can update settings'
  ) THEN
    CREATE POLICY "DEAN can update settings"
    ON public.transcription_settings
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.user_tier = 'DEAN'
      )
    );
  END IF;
END $$;

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_transcription_settings_updated_at ON public.transcription_settings;
CREATE TRIGGER update_transcription_settings_updated_at
BEFORE UPDATE ON public.transcription_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a single settings row if none exists, with offset = 13 as per current usage
INSERT INTO public.transcription_settings (alert_email, offset)
SELECT 'hello@prepgenie.io', 13
WHERE NOT EXISTS (SELECT 1 FROM public.transcription_settings);
