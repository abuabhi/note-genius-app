import { supabase } from '@/integrations/supabase/client';

export interface ProcessReferralParams {
  referred_user_id: string;
  referral_code_used: string;
}

export interface ProcessReferralResult {
  success: boolean;
  referrer_id?: string;
  points_awarded?: number;
  error?: string;
}

export class ReferralService {
  static async processReferralSignup(params: ProcessReferralParams): Promise<ProcessReferralResult> {
    try {
      console.log('👥 Processing referral signup via Edge Function...');
      
      // Use secure Edge Function instead of direct DB access
      const { data, error } = await supabase.functions.invoke('process-referral', {
        body: params
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to process referral'
        };
      }

      if (!data.success) {
        console.log('⚠️ Referral processing failed:', data.error);
        return {
          success: false,
          error: data.error || 'Failed to process referral'
        };
      }

      console.log('✅ Referral processed successfully');
      return {
        success: true,
        referrer_id: data.referrer_id,
        points_awarded: data.points_awarded
      };
    } catch (error) {
      console.error('💥 Error processing referral:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}