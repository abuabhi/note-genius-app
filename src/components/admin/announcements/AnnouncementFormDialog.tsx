
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAnnouncementForm } from './hooks/useAnnouncementForm';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { AdvancedSection } from './form-sections/AdvancedSection';
import { AnnouncementFormDialogProps } from './types';

export const AnnouncementFormDialog = ({
  open,
  onOpenChange,
  announcement
}: AnnouncementFormDialogProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { form, onSubmit, isSubmitting } = useAnnouncementForm(announcement, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </DialogTitle>
          <DialogDescription>
            {announcement 
              ? 'Update the announcement details below.' 
              : 'Create a new announcement to display to users across the application.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <BasicInfoSection control={form.control} />
            </div>

            <Separator />

            <AdvancedSection 
              control={form.control}
              isOpen={isAdvancedOpen}
              onOpenChange={setIsAdvancedOpen}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (announcement ? 'Updating...' : 'Creating...') 
                  : (announcement ? 'Update Announcement' : 'Create Announcement')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
