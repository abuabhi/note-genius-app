-- Fix: use base_offset instead of reserved keyword 'offset'
CREATE TABLE IF NOT EXISTS public.transcription_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_email TEXT NOT NULL DEFAULT 'hello@prepgenie.io',
  base_offset INTEGER NOT NULL DEFAULT 0,
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

DROP TRIGGER IF EXISTS update_transcription_settings_updated_at ON public.transcription_settings;
CREATE TRIGGER update_transcription_settings_updated_at
BEFORE UPDATE ON public.transcription_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.transcription_settings (alert_email, base_offset)
SELECT 'hello@prepgenie.io', 13
WHERE NOT EXISTS (SELECT 1 FROM public.transcription_settings);
