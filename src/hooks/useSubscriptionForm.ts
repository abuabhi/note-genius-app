import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { UserTier } from '@/hooks/useUserTier';
import { useManagedInterval } from '@/utils/performance/intervalManager';

export interface SubscriptionFormData {
  subscribed: boolean;
  subscriptionTier: UserTier | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  checkSubscriptionStatus: () => Promise<void>;
  createCheckoutSession: (tier: 'GRADUATE' | 'MASTER', billing: 'monthly' | 'yearly') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

export const useSubscriptionForm = (): SubscriptionFormData => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<UserTier | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || null);
      setSubscriptionEnd(data.subscription_end || null);
      
      // Update user tier in profiles table if subscription is active
      if (data.subscribed && data.subscription_tier) {
        await supabase
          .from('profiles')
          .update({ user_tier: data.subscription_tier })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (tier: 'GRADUATE' | 'MASTER', billing: 'monthly' | 'yearly') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const token = await getAuthToken();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, billing },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      console.error('🏦 [PORTAL] User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('🏦 [PORTAL] Opening customer portal for user:', user.email);

    try {
      const token = await getAuthToken();
      console.log('🏦 [PORTAL] Got auth token:', !!token);
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('🏦 [PORTAL] Function response:', { data, error });

      if (error) {
        console.error('🏦 [PORTAL] Function error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('🏦 [PORTAL] Opening URL:', data.url);
        window.open(data.url, '_blank');
      } else {
        console.error('🏦 [PORTAL] No URL returned from function');
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('🏦 [PORTAL] Error opening customer portal:', error);
      throw error;
    }
  };

  // Check subscription status on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Auto-refresh subscription status using managed interval
  useManagedInterval(
    'subscription-refresh',
    checkSubscriptionStatus,
    user ? (process.env.NODE_ENV === 'production' ? 600000 : 120000) : null // 10 min prod, 2 min dev (was 30s — too aggressive at scale)
  );

  return {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    isLoading,
    checkSubscriptionStatus,
    createCheckoutSession,
    openCustomerPortal,
  };
};