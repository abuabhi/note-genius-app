
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  compact_text: z.string().optional(),
  cta_text: z.string().optional(),
  cta_url: z.string().url().optional().or(z.literal('')),
  background_color: z.string().min(1, 'Background color is required'),
  text_color: z.string().min(1, 'Text color is required'),
  is_active: z.boolean(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  target_tier: z.string(),
  target_pages: z.string(),
  mobile_layout: z.string(),
  priority: z.number().min(1).max(10),
  dismissible: z.boolean(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: any;
}

export const AnnouncementFormDialog = ({ 
  open, 
  onOpenChange, 
  announcement 
}: AnnouncementFormDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      compact_text: announcement?.compact_text || '',
      cta_text: announcement?.cta_text || '',
      cta_url: announcement?.cta_url || '',
      background_color: announcement?.background_color || '#3b82f6',
      text_color: announcement?.text_color || '#ffffff',
      is_active: announcement?.is_active || false,
      start_date: announcement?.start_date ? 
        new Date(announcement.start_date).toISOString().slice(0, 16) : 
        new Date().toISOString().slice(0, 16),
      end_date: announcement?.end_date ? 
        new Date(announcement.end_date).toISOString().slice(0, 16) : 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      target_tier: announcement?.target_tier || 'all',
      target_pages: announcement?.target_pages ? 
        JSON.stringify(announcement.target_pages) : '["all"]',
      mobile_layout: announcement?.mobile_layout || 'compact',
      priority: announcement?.priority || 1,
      dismissible: announcement?.dismissible ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      const announcementData = {
        title: data.title,
        content: data.content,
        compact_text: data.compact_text || null,
        cta_text: data.cta_text || null,
        cta_url: data.cta_url || null,
        background_color: data.background_color,
        text_color: data.text_color,
        is_active: data.is_active,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        target_tier: data.target_tier,
        target_pages: JSON.parse(data.target_pages),
        mobile_layout: data.mobile_layout,
        priority: data.priority,
        dismissible: data.dismissible,
        created_by: user?.id,
      };

      if (announcement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', announcement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success(`Announcement ${announcement ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Failed to ${announcement ? 'update' : 'create'} announcement`);
      console.error('Error saving announcement:', error);
    }
  });

  const onSubmit = (data: AnnouncementFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </DialogTitle>
          <DialogDescription>
            Configure your announcement bar settings including mobile optimization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Announcement title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (1-10)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="1" 
                        max="10"
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Higher priority announcements appear first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Full announcement content" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compact_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Compact Text</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Shorter version for mobile (optional)" rows={2} />
                  </FormControl>
                  <FormDescription>Shown on mobile when using compact layout</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cta_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-to-Action Text</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Learn More" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cta_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-to-Action URL</FormLabel>
                    <FormControl>
                      <Input {...field} type="url" placeholder="https://example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="background_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <Input {...field} type="color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <FormControl>
                      <Input {...field} type="color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile_layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Layout</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="banner">Banner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target User Tier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="SCHOLAR">Scholar</SelectItem>
                        <SelectItem value="DEAN">Dean</SelectItem>
                        <SelectItem value="PROFESSOR">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Pages</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='["all"] or ["/dashboard", "/notes"]' />
                    </FormControl>
                    <FormDescription>JSON array of page paths</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable this announcement to show to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dismissible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Dismissible</FormLabel>
                      <FormDescription>
                        Allow users to dismiss this announcement
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending 
                  ? 'Saving...' 
                  : announcement 
                    ? 'Update Announcement' 
                    : 'Create Announcement'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
