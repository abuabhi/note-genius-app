
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Smartphone } from 'lucide-react';
import { AnnouncementFormDialog } from './AnnouncementFormDialog';
import { AnnouncementPreview } from './AnnouncementPreview';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  compact_text?: string;
  cta_text?: string;
  cta_url?: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  target_tier: string;
  target_pages: string[];
  mobile_layout: string;
  priority: number;
  dismissible: boolean;
  created_at: string;
}

export const AnnouncementManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
      return data as Announcement[];
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

  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date();
    const startDate = new Date(announcement.start_date);
    const endDate = new Date(announcement.end_date);

    if (!announcement.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-muted-foreground">
            Manage announcement bars that appear across the application
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <div className="grid gap-4">
        {announcements?.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <CardDescription>
                    {announcement.content.slice(0, 100)}
                    {announcement.content.length > 100 ? '...' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(announcement)}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    {announcement.mobile_layout}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Target Tier:</span>
                  <p className="text-muted-foreground">{announcement.target_tier}</p>
                </div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <p className="text-muted-foreground">{announcement.priority}</p>
                </div>
                <div>
                  <span className="font-medium">Start Date:</span>
                  <p className="text-muted-foreground">
                    {format(new Date(announcement.start_date), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <span className="font-medium">End Date:</span>
                  <p className="text-muted-foreground">
                    {format(new Date(announcement.end_date), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewAnnouncement(announcement)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAnnouncement(announcement)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(announcement)}
                  disabled={toggleActiveMutation.isPending}
                >
                  {announcement.is_active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(announcement.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {announcements?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                No announcements created yet. Create your first announcement to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AnnouncementFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        announcement={null}
      />

      <AnnouncementFormDialog
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && setEditingAnnouncement(null)}
        announcement={editingAnnouncement}
      />

      <AnnouncementPreview
        open={!!previewAnnouncement}
        onOpenChange={(open) => !open && setPreviewAnnouncement(null)}
        announcement={previewAnnouncement}
      />
    </div>
  );
};
