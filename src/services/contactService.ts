import { supabase } from '@/integrations/supabase/client';

export interface ContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ContactService {
  static async submitContactForm(data: ContactSubmission): Promise<ContactSubmissionResult> {
    try {
      console.log('📧 Submitting contact form via Edge Function...');
      
      // Use secure Edge Function instead of direct DB access
      const { data: result, error } = await supabase.functions.invoke('contact-submission', {
        body: data
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to submit contact form'
        };
      }

      if (!result.success) {
        console.error('❌ Edge Function returned failure:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to submit contact form'
        };
      }

      console.log('✅ Contact form submitted successfully');
      return {
        success: true,
        message: result.message || 'Thank you for your message!'
      };
    } catch (error) {
      console.error('💥 Error submitting contact form:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}