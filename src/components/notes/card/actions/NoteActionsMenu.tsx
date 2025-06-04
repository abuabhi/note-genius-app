
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
import { ConvertToFlashcardsAction } from "./ConvertToFlashcardsAction";
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
  
  console.log("NoteActionsMenu rendered with:", { 
    noteId, 
    noteTitle, 
    contentLength: noteContent?.length || 0,
    isPinned 
  });
  
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
            console.log("Note actions menu trigger clicked");
          }}
        >
          <MoreHorizontal className={`h-${iconSize} w-${iconSize}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white/95 backdrop-blur-sm border border-mint-200 w-56 shadow-xl rounded-xl p-2"
        sideOffset={8}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <PinAction 
          noteId={noteId}
          isPinned={isPinned}
          onPin={onPin}
        />
        
        <DropdownMenuSeparator className="bg-mint-100 my-2" />
        
        <ConvertToFlashcardsAction
          noteId={noteId}
          noteTitle={noteTitle}
          noteContent={noteContent}
        />
        
        <DropdownMenuSeparator className="bg-mint-100 my-2" />
        
        <DownloadActions 
          noteTitle={noteTitle} 
          noteContent={noteContent} 
        />
        
        <EmailAction 
          noteTitle={noteTitle} 
          noteContent={noteContent} 
        />
        
        <DropdownMenuSeparator className="bg-mint-100 my-2" />
        
        <DeleteAction 
          noteId={noteId} 
          onDelete={handleDelete} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
