
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
  onDelete: (id: string) => void;
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
        >
          <MoreHorizontal className={`h-${iconSize} w-${iconSize}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border border-mint-100 w-48">
        <PinAction 
          noteId={noteId}
          isPinned={isPinned}
          onPin={onPin}
        />
        
        <DropdownMenuSeparator />
        
        <DownloadActions 
          noteTitle={noteTitle} 
          noteContent={noteContent} 
        />
        
        <EmailAction 
          noteTitle={noteTitle} 
          noteContent={noteContent} 
        />
        
        <DropdownMenuSeparator />
        
        <DeleteAction 
          noteId={noteId} 
          onDelete={onDelete} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
