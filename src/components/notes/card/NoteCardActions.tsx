
import React from "react";
import { MoreHorizontal, Pin, Trash2, Download, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NoteCardActionsProps {
  noteId: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload?: (id: string, e: React.MouseEvent) => void;
  onEmail?: (id: string, e: React.MouseEvent) => void;
  isConfirmingDelete: boolean;
  iconSize?: number;
}

export const NoteCardActions = ({
  noteId,
  isPinned,
  onPin,
  onDelete,
  onDownload,
  onEmail,
  isConfirmingDelete,
  iconSize = 4
}: NoteCardActionsProps) => {
  const handleAction = (
    action: (id: string, ...args: any[]) => void,
    ...args: any[]
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action(noteId, ...args);
  };

  return (
    <div 
      className="absolute top-2 right-2"
      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking actions
    >
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
          <DropdownMenuItem 
            className="flex items-center cursor-pointer" 
            onClick={handleAction(onPin, isPinned)}
          >
            <Pin className="mr-2 h-4 w-4" />
            <span>{isPinned ? "Unpin note" : "Pin note"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer" 
            onClick={handleAction(onDelete)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{isConfirmingDelete ? "Click to confirm delete" : "Delete note"}</span>
          </DropdownMenuItem>
          
          {onDownload && (
            <DropdownMenuItem 
              className="flex items-center cursor-pointer" 
              onClick={handleAction(onDownload)}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Download</span>
            </DropdownMenuItem>
          )}
          
          {onEmail && (
            <DropdownMenuItem 
              className="flex items-center cursor-pointer" 
              onClick={handleAction(onEmail)}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Email</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
