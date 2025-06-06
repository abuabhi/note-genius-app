
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
        // Check if this user was already processed for this referral
        const { data: existingReferral } = await supabase
          .from('referrals')
          .select('id')
          .eq('referred_user_id', user.id)
          .eq('referral_code', referralCode)
          .single();

        if (existingReferral) {
          console.log('Referral already processed');
          return;
        }

        // Process the referral
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
          
          // Remove the referral code from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('ref');
          window.history.replaceState({}, '', newUrl.toString());
        } else {
          console.log('Invalid referral code');
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
