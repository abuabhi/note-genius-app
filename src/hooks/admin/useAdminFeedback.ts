
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the extended feedback type with profile data
export interface FeedbackWithProfile {
  id: string;
  user_id: string;
  type: 'rating' | 'feature_request' | 'bug_report';
  title: string;
  description?: string;
  rating?: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'major' | 'critical';
  admin_response?: string;
  responded_at?: string;
  responded_by?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
}

export const useAdminFeedback = () => {
  return useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Handle the case where profiles might not exist
      return (data || []).map(item => ({
        ...item,
        profiles: item.profiles || null
      })) as FeedbackWithProfile[];
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Feedback status updated successfully.');
    },
    onError: (error) => {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status.');
    },
  });
};

export const useRespondToFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      adminResponse, 
      status = 'resolved' 
    }: { 
      id: string; 
      adminResponse: string; 
      status?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feedback')
        .update({
          admin_response: adminResponse,
          responded_at: new Date().toISOString(),
          responded_by: user.user?.id,
          status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-feedback-notification', {
          body: {
            type: 'admin_response',
            feedbackId: id,
            adminResponse
          }
        });
        
        if (emailError) {
          console.warn('Email notification failed:', emailError);
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Response sent successfully!');
    },
    onError: (error) => {
      console.error('Error sending response:', error);
      toast.error('Failed to send response.');
    },
  });
};
