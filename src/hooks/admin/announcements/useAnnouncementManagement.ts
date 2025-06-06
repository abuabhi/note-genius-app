
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Announcement } from '@/components/admin/announcements/types';

export const useAnnouncementManagement = () => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure text_align field exists with default value
      return (data || []).map(announcement => ({
        ...announcement,
        text_align: announcement.text_align || 'center'
      })) as Announcement[];
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update announcement');
      console.error('Error updating announcement:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete announcement');
      console.error('Error deleting announcement:', error);
    }
  });

  const handleToggleActive = (announcement: Announcement) => {
    toggleActiveMutation.mutate({
      id: announcement.id,
      is_active: !announcement.is_active
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  return {
    announcements,
    isLoading,
    editingAnnouncement,
    setEditingAnnouncement,
    previewAnnouncement,
    setPreviewAnnouncement,
    handleToggleActive,
    handleDelete,
    isToggling: toggleActiveMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
