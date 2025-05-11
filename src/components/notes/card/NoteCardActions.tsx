
import React from "react";
import { Button } from "@/components/ui/button";
import { Pin, Trash2 } from "lucide-react";

interface NoteCardActionsProps {
  noteId: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isConfirmingDelete: boolean;
  iconSize?: number;
}

export const NoteCardActions = ({
  noteId,
  isPinned,
  onPin,
  onDelete,
  isConfirmingDelete,
  iconSize = 4
}: NoteCardActionsProps) => {
  return (
    <div 
      className="absolute top-2 right-2 flex gap-1"
      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking actions
    >
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${isPinned ? 'text-mint-600' : 'text-muted-foreground'}`}
        onClick={(e) => onPin(noteId, isPinned, e)}
        title={isPinned ? "Unpin note" : "Pin note"}
      >
        <Pin className={`h-${iconSize} w-${iconSize}`} />
      </Button>
      
      <Button
        variant={isConfirmingDelete ? "destructive" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={(e) => onDelete(noteId, e)}
        title={isConfirmingDelete ? "Click again to confirm delete" : "Delete note"}
      >
        <Trash2 className={`h-${iconSize} w-${iconSize}`} />
      </Button>
    </div>
  );
};
