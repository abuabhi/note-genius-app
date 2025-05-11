
import React from "react";
import { MoreHorizontal, Pin, Trash2, Download, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NoteCardActionsProps {
  noteId: string;
  noteTitle: string;
  noteContent?: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  iconSize?: number;
}

export const NoteCardActions = ({
  noteId,
  noteTitle,
  noteContent = "",
  isPinned,
  onPin,
  onDelete,
  iconSize = 4
}: NoteCardActionsProps) => {
  const handleAction = (
    action: (id: string, ...args: any[]) => void,
    ...args: any[]
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action(noteId, ...args);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a text file with the note content
    const element = document.createElement("a");
    const file = new Blob([`# ${noteTitle}\n\n${noteContent}`], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${noteTitle.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Note downloaded successfully");
  };
  
  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a mailto link with the note content
    const subject = encodeURIComponent(`Note: ${noteTitle}`);
    const body = encodeURIComponent(`${noteTitle}\n\n${noteContent}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Email client opened");
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
            <span>Delete note</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer" 
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            <span>Download</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer" 
            onClick={handleEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>Email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
