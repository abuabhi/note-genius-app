
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const ReferralSignupHandler = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const urlReferralCode = searchParams.get('ref');

  useEffect(() => {
    const processReferral = async () => {
      if (!user) return;

      try {
        // Check if this user was already processed for referrals
        const { data: existingReferral } = await supabase
          .from('referrals')
          .select('id')
          .eq('referred_user_id', user.id)
          .single();

        if (existingReferral) {
          console.log('User already processed for referrals');
          return;
        }

        // Get referral code from URL or user metadata
        const referralCode = urlReferralCode || user.user_metadata?.referral_code;
        
        if (!referralCode) {
          console.log('No referral code found');
          return;
        }

        // Process the referral using the database function
        const { data, error } = await supabase.rpc('process_referral_signup', {
          referred_user_id: user.id,
          referral_code_used: referralCode
        });

        if (error) {
          console.error('Error processing referral:', error);
          return;
        }

        if (data) {
          toast.success('Welcome! You\'ve been successfully referred by a friend! 🎉');
          
          // Remove the referral code from URL if it was there
          if (urlReferralCode) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('ref');
            window.history.replaceState({}, '', newUrl.toString());
          }
        } else {
          console.log('Invalid or expired referral code');
        }

      } catch (error) {
        console.error('Error processing referral:', error);
      }
    };

    // Add a small delay to ensure the user profile is fully created
    const timer = setTimeout(processReferral, 2000);
    return () => clearTimeout(timer);
  }, [user, urlReferralCode]);

  return null;
};
