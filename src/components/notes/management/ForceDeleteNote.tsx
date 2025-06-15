import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Note } from '@/types/note';
import { useAuth } from '@/hooks/auth/useAuth';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForceDeleteNoteProps {
  noteId: string;
}

export const ForceDeleteNote = ({ noteId }: ForceDeleteNoteProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { notes, setNotes } = useOptimizedNotes();

  const handleDelete = async () => {
    if (!user || !noteId) return;

    setIsDeleting(true);
    try {
      // 1. Delete from Supabase
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error("Supabase delete error:", error);
        toast.error("Failed to delete note from database.");
        return;
      }

      // 2. Remove from local state
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);

      toast.success("Note force deleted successfully!");
    } catch (err) {
      console.error("Force delete error:", err);
      toast.error("Failed to force delete note.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="space-x-2"
    >
      <Trash2 className="h-4 w-4" />
      <span>
        {isDeleting ? "Deleting..." : "Force Delete"}
      </span>
    </Button>
  );
};
