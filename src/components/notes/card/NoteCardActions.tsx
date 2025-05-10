
import { Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface NoteCardActionsProps {
  noteId: string;
  isPinned: boolean;
  isConfirmingDelete: boolean;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const NoteCardActions = ({
  noteId,
  isPinned,
  isConfirmingDelete,
  onPin,
  onDelete
}: NoteCardActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = (e: React.MouseEvent) => {
    setShowDeleteDialog(false);
    onDelete(noteId, e);
  };

  return (
    <>
      <div className="absolute top-2 right-2 flex gap-1">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-6 w-6 rounded-full bg-white/80 hover:bg-white shadow-sm"
          onClick={(e) => onPin(noteId, isPinned, e)}
          title={isPinned ? "Unpin note" : "Pin note"}
        >
          {isPinned ? 
            <PinOff className="h-3 w-3 text-mint-700" /> : 
            <Pin className="h-3 w-3 text-mint-700" />
          }
        </Button>
        <Button 
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full bg-white/80 hover:bg-white shadow-sm"
          onClick={handleDeleteClick}
          title="Delete note"
        >
          <Trash2 className="h-3 w-3 text-mint-700" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
