
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAnnouncementForm } from './hooks/useAnnouncementForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { CallToActionSection } from './form-sections/CallToActionSection';
import { StylingSection } from './form-sections/StylingSection';
import { SchedulingSection } from './form-sections/SchedulingSection';
import { TargetingSection } from './form-sections/TargetingSection';
import { SettingsSection } from './form-sections/SettingsSection';
import { AnnouncementFormDialogProps } from './types';

export const AnnouncementFormDialog = ({ 
  open, 
  onOpenChange, 
  announcement 
}: AnnouncementFormDialogProps) => {
  const { form, onSubmit, isSubmitting } = useAnnouncementForm(announcement, onOpenChange);

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
            <BasicInfoSection control={form.control} />
            <CallToActionSection control={form.control} />
            <StylingSection control={form.control} />
            <SchedulingSection control={form.control} />
            <TargetingSection control={form.control} />
            <SettingsSection control={form.control} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
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
