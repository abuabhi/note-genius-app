
-- 1) Normalize any duplicate referral codes by nulling duplicates (keep one winner)
WITH dupes AS (
  SELECT
    referral_code,
    array_agg(id ORDER BY id) AS ids
  FROM public.profiles
  WHERE referral_code IS NOT NULL
  GROUP BY referral_code
  HAVING COUNT(*) > 1
)
UPDATE public.profiles p
SET referral_code = NULL
FROM dupes d
WHERE p.referral_code = d.referral_code
  AND p.id <> d.ids[1];

-- 2) Create a normalization trigger to keep referral_code uppercase and alphanumeric
CREATE OR REPLACE FUNCTION public.normalize_referral_code_fn()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  IF NEW.referral_code IS NOT NULL THEN
    NEW.referral_code := UPPER(regexp_replace(NEW.referral_code, '[^a-zA-Z0-9]', '', 'g'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_referral_code_trg ON public.profiles;

CREATE TRIGGER normalize_referral_code_trg
BEFORE INSERT OR UPDATE OF referral_code ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.normalize_referral_code_fn();

-- 3) Enforce uniqueness on referral_code while allowing NULLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code_unique
  ON public.profiles (referral_code)
  WHERE referral_code IS NOT NULL;

-- 4) Function to generate a unique referral code from a base (e.g., username)
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code(base_code text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  base text;
  suffix text;
  full_code text;
  attempt int := 0;
BEGIN
  -- sanitize and trim base to 8 chars
  base := UPPER(LEFT(COALESCE(regexp_replace(base_code, '[^a-zA-Z0-9]', '', 'g'), ''), 8));

  -- fallback base if none
  IF base = '' THEN
    base := UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 6));
  END IF;

  LOOP
    IF attempt = 0 THEN
      suffix := '';
    ELSE
      suffix := LPAD(attempt::text, 2, '0');
    END IF;

    full_code := base || suffix;

    -- unique across profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = full_code) THEN
      RETURN full_code;
    END IF;

    attempt := attempt + 1;

    -- hard fallback to a random 8-char code after 99 attempts
    IF attempt > 99 THEN
      full_code := UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = full_code) THEN
        RETURN full_code;
      END IF;
      -- keep trying if extremely unlucky
      attempt := 0;
      base := UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 6));
    END IF;
  END LOOP;
END;
$$;

-- 5) Function to get or create the referral code for a specific user
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id uuid, preferred_base text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  existing text;
  username text;
  code text;
BEGIN
  -- If user already has a code, return it
  SELECT referral_code INTO existing
  FROM public.profiles
  WHERE id = p_user_id;

  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;

  -- Use username as base if available (sanitized inside generator)
  SELECT username INTO username
  FROM public.profiles
  WHERE id = p_user_id;

  code := public.generate_unique_referral_code(COALESCE(preferred_base, username));

  UPDATE public.profiles
  SET referral_code = code, updated_at = now()
  WHERE id = p_user_id;

  RETURN code;
END;
$$;

-- 6) Safe RPC for clients: get current user's code (auth required)
CREATE OR REPLACE FUNCTION public.get_my_referral_code(preferred_base text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN public.get_or_create_referral_code(uid, preferred_base);
END;
$$;

-- 7) Optional: auto-generate on signup by enhancing handle_new_user
--    Keeps existing behavior and adds referral_code generation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  base_username text;
  new_code text;
BEGIN
  base_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  new_code := public.generate_unique_referral_code(base_username);

  INSERT INTO public.profiles (
    id,
    username,
    first_name,
    user_tier,
    onboarding_completed,
    referral_code
  )
  VALUES (
    new.id,
    base_username,
    new.raw_user_meta_data->>'first_name',
    'SCHOLAR',
    FALSE,
    new_code
  );
  RETURN NEW;
END;
$$;
