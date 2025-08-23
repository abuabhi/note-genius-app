import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateResourceForm } from '../forms/CreateResourceForm';
import { Resource, ResourceFormData } from '@/types/resource';
import { useResources } from '@/hooks/useResources';

interface EditResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
}

export const EditResourceDialog = ({ open, onOpenChange, resource }: EditResourceDialogProps) => {
  const { updateResource } = useResources();

  const handleSave = async (formData: ResourceFormData) => {
    if (!resource) {
      return { success: false, error: 'No resource to update' };
    }

    try {
      // Convert ResourceFormData to Resource updates
      const updates: Partial<Resource> = {
        title: formData.title,
        description: formData.description,
        author: formData.author,
        difficulty_level: formData.difficulty_level,
        tags: formData.tags,
        subject_id: formData.subject_id,
      };

      await updateResource(resource.id, updates);
      onOpenChange(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating resource:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update resource' 
      };
    }
  };

  if (!resource) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Resource</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <CreateResourceForm onSave={handleSave} initialData={resource} />
        </div>
      </DialogContent>
    </Dialog>
  );
};