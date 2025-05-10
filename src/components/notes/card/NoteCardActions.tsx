
import { Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
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
        variant={isConfirmingDelete ? "destructive" : "ghost"}
        size="icon"
        className={`h-6 w-6 rounded-full ${
          isConfirmingDelete ? 
          "bg-red-500 hover:bg-red-600" : 
          "bg-white/80 hover:bg-white shadow-sm"
        }`}
        onClick={(e) => onDelete(noteId, e)}
        title={isConfirmingDelete ? "Click again to confirm delete" : "Delete note"}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};
