
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useSendReferralEmails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const sendReferralEmails = async (emails: string[], message: string, referralCode: string) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Sending individual referral emails:', { emails, referralCode });
      
      // Get referrer name from user profile
      const referrerName = ((user as any)?.user_metadata?.username as string) || (user?.email ? user.email.split("@")[0] : undefined) || 'A friend';
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Send individual emails
      for (const email of emails) {
        try {
          console.log(`📧 Sending referral email to: ${email}`);
          
          const { data, error } = await supabase.functions.invoke('send-referral-email', {
            body: {
              to: email,
              referrerName: referrerName,
              referralCode: referralCode,
              type: 'invitation',
              message: message || undefined
            }
          });

          if (error) {
            console.error(`❌ Error sending email to ${email}:`, error);
            errorCount++;
            errors.push(`${email}: ${error.message || 'Unknown error'}`);
          } else {
            console.log(`✅ Email sent successfully to ${email}:`, data);
            successCount++;
          }
        } catch (individualError) {
          console.error(`❌ Network error sending email to ${email}:`, individualError);
          errorCount++;
          errors.push(`${email}: Network error`);
        }
      }

      // Return success/error status for the form component to handle
      if (successCount > 0 && errorCount === 0) {
        return { success: true, message: `Successfully sent ${successCount} referral invitation${successCount > 1 ? 's' : ''}! 🎉` };
      } else if (successCount > 0 && errorCount > 0) {
        return { success: true, message: `Sent ${successCount} invitations successfully, but ${errorCount} failed` };
      } else {
        return { success: false, message: 'Failed to send referral invitations. Please try again.' };
      }
      
    } catch (error) {
      console.error('❌ Network error sending referral emails:', error);
      return { success: false, message: 'Network error. Please check your connection and try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendReferralEmails,
    isLoading
  };
};
