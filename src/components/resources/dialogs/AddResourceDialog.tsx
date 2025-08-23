import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateResourceForm } from '../forms/CreateResourceForm';
import { ResourceFormData } from '@/types/resource';
import { useResources } from '@/hooks/useResources';

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddResourceDialog = ({ open, onOpenChange }: AddResourceDialogProps) => {
  const { addResource } = useResources();

  const handleSave = async (formData: ResourceFormData) => {
    const result = await addResource(formData);
    
    if (result.success) {
      onOpenChange(false);
    }
    
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Resource</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <CreateResourceForm onSave={handleSave} />
        </div>
      </DialogContent>
    </Dialog>
  );
};