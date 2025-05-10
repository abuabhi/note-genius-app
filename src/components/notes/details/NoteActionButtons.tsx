
import { Archive, Book, Edit, Pin, PinOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/note';
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

interface NoteActionButtonsProps {
  note: Note;
  isDeleting: boolean;
  onEdit: () => void;
  onOpenStudyMode: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const NoteActionButtons = ({
  note,
  isDeleting,
  onEdit,
  onOpenStudyMode,
  onPin,
  onArchive,
  onDelete
}: NoteActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="default" 
        className="flex items-center gap-2 bg-mint-600 hover:bg-mint-700"
        onClick={onOpenStudyMode}
      >
        <Book className="h-4 w-4" />
        Study Mode
      </Button>
    
      <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
        <Edit className="h-4 w-4" />
        Edit
      </Button>
      <Button variant="outline" onClick={onPin} className="flex items-center gap-2">
        {note.pinned ? (
          <>
            <PinOff className="h-4 w-4" />
            Unpin
          </>
        ) : (
          <>
            <Pin className="h-4 w-4" />
            Pin
          </>
        )}
      </Button>
      <Button variant="outline" onClick={onArchive} className="flex items-center gap-2">
        <Archive className="h-4 w-4" />
        {note.archived ? 'Restore' : 'Archive'}
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note "{note.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
