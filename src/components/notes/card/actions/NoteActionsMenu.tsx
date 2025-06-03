
import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PinAction } from "./PinAction";
import { DownloadActions } from "./DownloadActions";
import { EmailAction } from "./EmailAction";
import { DeleteAction } from "./DeleteAction";

interface NoteActionsMenuProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  iconSize?: number;
}

export const NoteActionsMenu = ({
  noteId,
  noteTitle,
  noteContent,
  isPinned,
  onPin,
  onDelete,
  iconSize = 4
}: NoteActionsMenuProps) => {
  const [open, setOpen] = React.useState(false);
  
  const handleDelete = async (id: string) => {
    console.log("NoteActionsMenu - Delete triggered for note ID:", id);
    setOpen(false); // Close dropdown immediately
    try {
      await onDelete(id);
      console.log("NoteActionsMenu - Delete successful for note ID:", id);
    } catch (error) {
      console.error("NoteActionsMenu - Delete failed for note ID:", id, error);
      throw error;
    }
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-mint-700 hover:bg-mint-50 transition-all duration-200 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className={`h-${iconSize} w-${iconSize}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white border border-mint-100 w-52 shadow-lg rounded-lg p-1"
        sideOffset={4}
      >
        <PinAction 
          noteId={noteId}
          isPinned={isPinned}
          onPin={onPin}
        />
        
        <DropdownMenuSeparator className="bg-mint-100" />
        
        <DownloadActions 
          noteTitle={noteTitle} 
          noteContent={noteContent} 
        />
        
        <EmailAction 
          noteTitle={noteTitle} 
          noteContent={noteContent} 
        />
        
        <DropdownMenuSeparator className="bg-mint-100" />
        
        <DeleteAction 
          noteId={noteId} 
          onDelete={handleDelete} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
