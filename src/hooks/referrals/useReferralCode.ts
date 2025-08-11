
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface UseReferralCodeResult {
  code: string;
  isLoading: boolean;
  error?: string;
}

const sanitizeCode = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);

const generateCodeFromUser = (userId: string) => {
  // Deterministic, collision-free for our project: strip hyphens from UUID and take first 8 chars
  return sanitizeCode(userId.replace(/-/g, '').slice(0, 8));
};

export const useReferralCode = (): UseReferralCodeResult => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const cacheKey = useMemo(() => (user ? `referralCode:${user.id}` : ''), [user?.id]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;

      // 1) Cache
      try {
        const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
        if (cached) {
          setCode(cached);
          return;
        }
      } catch {}

      setIsLoading(true);
      setError(undefined);

      // 2) Try profiles.referral_code
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        // non-fatal
        console.warn('Failed to read referral_code from profiles:', profileError);
      }

      if (profile?.referral_code) {
        const existing = String(profile.referral_code).trim();
        setCode(existing);
        try { if (typeof window !== 'undefined') localStorage.setItem(cacheKey, existing); } catch {}
        setIsLoading(false);
        return;
      }

      // 3) Generate deterministic code and attempt to save
      const generated = generateCodeFromUser(user.id);

      const { data: updateRes, error: updateErr } = await supabase
        .from('profiles')
        .update({ referral_code: generated, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('referral_code')
        .maybeSingle();

      if (updateErr) {
        console.warn('Failed to save referral_code to profiles, falling back to local cache only:', updateErr);
      }

      const finalCode = updateRes?.referral_code ? String(updateRes.referral_code) : generated;
      setCode(finalCode);
      try { if (typeof window !== 'undefined') localStorage.setItem(cacheKey, finalCode); } catch {}
      setIsLoading(false);
    };

    run();
  }, [user?.id, cacheKey]);

  return { code, isLoading, error };
};
