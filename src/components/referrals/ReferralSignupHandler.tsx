
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const ReferralSignupHandler = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    const processReferral = async () => {
      if (!user || !referralCode) return;

      try {
        // Check if referrals table exists and this user was already processed
        let existingReferral;
        try {
          const { data } = await (supabase as any)
            .from('referrals')
            .select('id')
            .eq('referred_user_id', user.id)
            .eq('referral_code', referralCode)
            .single();
          existingReferral = data;
        } catch (error) {
          // Referrals table might not exist yet
          console.log('Referrals table not available yet');
          return;
        }

        if (existingReferral) {
          console.log('Referral already processed');
          return;
        }

        // Try to process the referral using the function (if available)
        try {
          const { data, error } = await (supabase as any).rpc('process_referral_signup', {
            referred_user_id: user.id,
            referral_code_used: referralCode
          });

          if (error) {
            console.error('Error processing referral:', error);
            return;
          }

          if (data) {
            toast.success('Welcome! You\'ve been successfully referred by a friend! 🎉');
            
            // Remove the referral code from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('ref');
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            console.log('Invalid referral code');
          }
        } catch (error) {
          console.log('Referral processing function not available yet');
          // Store the referral code for later processing when the system is fully set up
          sessionStorage.setItem('pendingReferralCode', referralCode);
        }
      } catch (error) {
        console.error('Error processing referral:', error);
      }
    };

    // Add a small delay to ensure the user profile is fully created
    const timer = setTimeout(processReferral, 2000);
    return () => clearTimeout(timer);
  }, [user, referralCode]);

  return null; // This component doesn't render anything
};
