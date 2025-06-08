
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Feedback, CreateFeedbackData } from '@/types/feedback';
import { toast } from 'sonner';
import { useAdminSettings } from '@/hooks/admin/useAdminSettings';

export const useFeedback = () => {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const { data: adminSettings } = useAdminSettings();

  return useMutation({
    mutationFn: async (feedbackData: CreateFeedbackData) => {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Check feedback mode
      const isExternalMode = adminSettings?.feedback_mode === 'external';
      
      if (isExternalMode && adminSettings?.support_email) {
        // External mode: Send email only
        const { error: emailError } = await supabase.functions.invoke('send-feedback-notification', {
          body: {
            type: 'external_feedback',
            feedbackData: {
              ...feedbackData,
              user_id: userId
            },
            supportEmail: adminSettings.support_email
          }
        });
        
        if (emailError) {
          console.error('External feedback email failed:', emailError);
          throw new Error('Failed to send feedback to support team');
        }

        return { id: 'external', ...feedbackData, user_id: userId };
      } else {
        // Internal mode: Save to database
        const { data, error } = await supabase
          .from('feedback')
          .insert([{
            ...feedbackData,
            user_id: userId
          }])
          .select()
          .single();

        if (error) throw error;

        // Send thank you email notification
        try {
          const { error: emailError } = await supabase.functions.invoke('send-feedback-notification', {
            body: {
              type: 'thank_you',
              feedbackId: data.id
            }
          });
          
          if (emailError) {
            console.warn('Thank you email failed:', emailError);
          }
        } catch (emailError) {
          console.warn('Thank you email failed:', emailError);
        }

        return data as Feedback;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      const isExternalMode = adminSettings?.feedback_mode === 'external';
      
      if (isExternalMode) {
        toast.success('Feedback sent successfully! Our support team will get back to you soon.');
      } else {
        toast.success('Feedback submitted successfully! Thank you for helping us improve.');
      }
    },
    onError: (error) => {
      console.error('Error creating feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    },
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback status updated successfully.');
    },
    onError: (error) => {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status.');
    },
  });
};
