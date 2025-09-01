-- COMPREHENSIVE SECURITY FIXES - Phase 2: Continue Function Security Updates

-- Continue updating remaining functions with secure search_path

-- Function: get_or_create_referral_code
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id uuid, preferred_base text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Function: get_my_referral_code
CREATE OR REPLACE FUNCTION public.get_my_referral_code(preferred_base text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN public.get_or_create_referral_code(uid, preferred_base);
END;
$function$;

-- Function: update_user_tier
CREATE OR REPLACE FUNCTION public.update_user_tier(target_user_id uuid, new_tier text, reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  old_tier TEXT;
  admin_user_id UUID;
BEGIN
  -- Verify caller is DEAN tier
  admin_user_id := auth.uid();
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_user_id AND user_tier = 'DEAN'
  ) THEN
    RAISE EXCEPTION 'Access denied: Only DEAN users can update user tiers';
  END IF;
  
  -- Validate new tier value
  IF new_tier NOT IN ('SCHOLAR', 'GRADUATE', 'MASTER', 'DEAN') THEN
    RAISE EXCEPTION 'Invalid tier: %', new_tier;
  END IF;
  
  -- Get current tier for audit
  SELECT user_tier::text INTO old_tier 
  FROM public.profiles 
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Prevent DEAN users from demoting themselves
  IF target_user_id = admin_user_id AND new_tier != 'DEAN' THEN
    RAISE EXCEPTION 'DEAN users cannot demote themselves';
  END IF;
  
  -- Update the tier
  UPDATE public.profiles 
  SET user_tier = new_tier::user_tier, updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Log the change in audit table
  INSERT INTO public.influencer_promotions_audit (
    user_id,
    promoted_by,
    from_tier,
    to_tier,
    promotion_type,
    notes
  ) VALUES (
    target_user_id,
    admin_user_id,
    old_tier,
    new_tier,
    'admin_update',
    COALESCE(reason, 'Administrative tier update')
  );
  
  RETURN TRUE;
END;
$function$;

-- Function: filter_user_notes
CREATE OR REPLACE FUNCTION public.filter_user_notes(p_user_id uuid, p_search_term text DEFAULT ''::text, p_subject_name text DEFAULT 'all'::text, p_show_archived boolean DEFAULT false, p_sort_by text DEFAULT 'newest'::text, p_page_num integer DEFAULT 0, p_page_size integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Ownership guard: allow service_role (auth.uid() IS NULL), otherwise require self-access
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' notes';
  END IF;

  WITH filtered_notes AS (
    SELECT 
      n.id,
      n.title,
      n.description,
      n.content,
      n.date,
      n.subject,
      n.subject_id,
      n.source_type,
      n.archived,
      n.pinned,
      n.created_at,
      n.updated_at,
      COALESCE(us.name, n.subject, 'Uncategorized') as subject_name,
      ARRAY(
        SELECT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'color', t.color
        )
        FROM public.note_tags nt
        JOIN public.tags t ON t.id = nt.tag_id
        WHERE nt.note_id = n.id
      ) as tags
    FROM public.notes n
    LEFT JOIN public.user_subjects us ON us.id = n.subject_id
    WHERE n.user_id = p_user_id
      AND (NOT p_show_archived AND n.archived = false OR p_show_archived)
      AND (
        p_search_term = '' OR 
        n.title ILIKE '%' || p_search_term || '%' OR 
        n.description ILIKE '%' || p_search_term || '%'
      )
      AND (
        p_subject_name = 'all' OR 
        COALESCE(us.name, n.subject) = p_subject_name
      )
  ),
  sorted_notes AS (
    SELECT *
    FROM filtered_notes
    ORDER BY 
      CASE WHEN p_sort_by = 'newest' THEN pinned END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'newest' THEN updated_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'oldest' THEN pinned END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'oldest' THEN created_at END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'alphabetical' THEN pinned END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'alphabetical' THEN title END ASC NULLS LAST
  ),
  paginated_notes AS (
    SELECT *
    FROM sorted_notes
    LIMIT p_page_size
    OFFSET (p_page_num * p_page_size)
  ),
  total_count AS (
    SELECT COUNT(*) as count FROM filtered_notes
  )
  SELECT jsonb_build_object(
    'data', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'description', description,
          'content', content,
          'date', date,
          'subject', subject_name,
          'sourceType', source_type,
          'archived', archived,
          'pinned', pinned,
          'subject_id', subject_id,
          'tags', tags
        )
      ) FROM paginated_notes), 
      '[]'::jsonb
    ),
    'total_count', (SELECT count FROM total_count),
    'has_more', (SELECT count FROM total_count) > ((p_page_num + 1) * p_page_size),
    'current_page', p_page_num,
    'page_size', p_page_size
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Secure Coupon Validation: Replace public coupon access with server-side validation
-- Remove public access to coupon details to prevent scraping
DROP POLICY IF EXISTS "Public can view active coupons for validation" ON public.influencer_coupons;

-- Create secure server-side validation function for coupons
CREATE OR REPLACE FUNCTION public.validate_coupon_secure(coupon_code_param text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  coupon_record public.influencer_coupons%ROWTYPE;
  result jsonb;
BEGIN
  -- Find the coupon (internal validation only)
  SELECT * INTO coupon_record
  FROM public.influencer_coupons
  WHERE coupon_code = coupon_code_param
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (usage_limit IS NULL OR current_usage < usage_limit);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon'
    );
  END IF;
  
  -- Return minimal validation info (don't expose sensitive details)
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'discount_percentage', coupon_record.discount_percentage,
    'discount_amount', coupon_record.discount_amount
  );
END;
$function$;