import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Announcement } from '@/components/admin/announcements/types';

export const useAnnouncementManagement = () => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const queryClient = useQueryClient();

  // Helper function to ensure text_align is a valid enum value
  const ensureValidTextAlign = (value: string): 'left' | 'center' | 'right' => {
    if (value === 'left' || value === 'right') return value;
    // Default to center for any invalid or unknown values
    return 'center';
  };

  // Helper function to ensure mobile_layout is a valid enum value
  const ensureValidMobileLayout = (value: string): 'default' | 'condensed' | 'expanded' => {
    if (value === 'default' || value === 'condensed' || value === 'expanded') return value;
    // Default to 'default' for any invalid or unknown values
    return 'default';
  };

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure proper type conversion and defaults
      return (data || []).map(announcement => {
        let target_pages: string[];
        
        // Handle target_pages conversion safely
        if (typeof announcement.target_pages === 'string') {
          try {
            target_pages = JSON.parse(announcement.target_pages);
          } catch {
            target_pages = [announcement.target_pages];
          }
        } else if (Array.isArray(announcement.target_pages)) {
          // Convert Json[] to string[] safely
          target_pages = announcement.target_pages.map(page => 
            typeof page === 'string' ? page : String(page)
          );
        } else {
          target_pages = ['all'];
        }

        // Convert raw data to match our Announcement type
        return {
          ...announcement,
          text_align: ensureValidTextAlign(announcement.text_align || 'center'),
          mobile_layout: ensureValidMobileLayout(announcement.mobile_layout || 'default'),
          target_pages,
        };
      });
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
