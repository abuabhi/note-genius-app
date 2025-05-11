
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';

interface NoteManagementProps {
  noteId?: string;
}

export const NoteManagement = ({ noteId }: NoteManagementProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!noteId) return null;

  const handleForceDelete = async () => {
    if (!user || !noteId) return;
    
    try {
      setIsDeleting(true);
      
      // Call the edge function to delete the note
      const { data, error } = await supabase.functions.invoke('manage-notes', {
        body: { 
          action: 'delete',
          noteId
        },
      });
      
      if (error) throw error;
      
      toast.success('Note has been permanently deleted');
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4 border border-red-200 rounded-md p-4 bg-red-50">
      <h4 className="text-red-600 font-medium mb-2">Advanced Options</h4>
      <p className="text-sm text-gray-600 mb-4">
        If you're having issues with this note, you can force delete it from our system.
        <strong className="text-red-600"> This action cannot be undone.</strong>
      </p>
      
      <Button 
        variant="destructive" 
        onClick={handleForceDelete}
        disabled={isDeleting}
        className="flex items-center gap-2"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash className="h-4 w-4" />
        )}
        {isDeleting ? 'Deleting...' : 'Force Delete Note'}
      </Button>
    </div>
  );
};
