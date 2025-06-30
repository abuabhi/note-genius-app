
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSendReferralEmails = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendReferralEmails = async (emails: string[], message: string, referralCode: string) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Sending referral emails:', { emails, referralCode });
      
      const { data, error } = await supabase.functions.invoke('send-referral-email', {
        body: {
          emails,
          message,
          referralCode
        }
      });

      if (error) {
        console.error('❌ Error sending referral emails:', error);
        toast.error('Failed to send referral emails. Please try again.');
        return false;
      }

      console.log('✅ Referral emails sent successfully:', data);
      toast.success(`Successfully sent ${emails.length} referral invitation${emails.length > 1 ? 's' : ''}! 🎉`);
      return true;
    } catch (error) {
      console.error('❌ Network error sending referral emails:', error);
      toast.error('Network error. Please check your connection and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendReferralEmails,
    isLoading
  };
};
