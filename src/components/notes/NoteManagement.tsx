
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
      
      // Call the edge function directly to delete the note
      const { data, error } = await supabase.functions.invoke('delete-note', {
        body: { noteId }
      });
      
      if (error) {
        console.error("Error in edge function:", error);
        throw error;
      }
      
      toast.success('Note has been permanently deleted');
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(`Failed to delete note: ${error.message || "Unknown error"}`);
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
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
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
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this note and cannot be undone.
              All associated data will be removed from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
