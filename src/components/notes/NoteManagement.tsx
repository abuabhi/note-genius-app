
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash, AlertTriangle } from 'lucide-react';
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
  
  if (!user || !noteId) return null;

  const handleForceDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Force deleting note...");
      
      // Call the edge function directly to delete the note with admin privileges
      const { data, error } = await supabase.functions.invoke('delete-note', {
        body: { noteId }
      });
      
      if (error) {
        console.error("Error in edge function:", error);
        toast.dismiss();
        toast.error(`Failed to delete note: ${error.message || "Unknown error"}`);
        throw error;
      }
      
      toast.dismiss();
      toast.success('Note has been permanently deleted');
      
      // Navigate back to notes list
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.dismiss();
      toast.error(`Failed to delete note: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4 border border-red-200 rounded-md p-4 bg-red-50">
      <div className="flex items-start space-x-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-red-600 font-medium">Troubleshooting Options</h4>
          <p className="text-sm text-gray-600 mb-4">
            If you're having trouble deleting this note through normal methods, you can force delete it.
            <strong className="text-red-600"> This action cannot be undone.</strong>
          </p>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            disabled={isDeleting}
            className="flex items-center gap-2 w-full sm:w-auto"
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
            <AlertDialogTitle className="text-red-600">Confirm Force Delete</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">This will permanently delete this note and all associated data from the database using administrative privileges.</p>
              <p className="font-bold text-red-600">This action cannot be undone under any circumstances.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Yes, Permanently Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
