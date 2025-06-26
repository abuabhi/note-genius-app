
import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PinAction } from "./PinAction";
import { ConvertToFlashcardsAction } from "./ConvertToFlashcardsAction";
import { ConvertToQuizAction } from "./ConvertToQuizAction";
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
  console.log("NoteActionsMenu rendered with:", { 
    noteId, 
    noteTitle, 
    contentLength: noteContent?.length || 0,
    isPinned 
  });
  
  const handleDelete = async (id: string) => {
    console.log("NoteActionsMenu - Delete triggered for note ID:", id);
    try {
      await onDelete(id);
      console.log("NoteActionsMenu - Delete successful for note ID:", id);
    } catch (error) {
      console.error("NoteActionsMenu - Delete failed for note ID:", id, error);
      throw error;
    }
  };
  
  return (
    <>
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
      
      <ConvertToQuizAction
        noteId={noteId}
        noteTitle={noteTitle}
        noteContent={noteContent}
      />
      
      <DropdownMenuSeparator className="bg-mint-100 my-2" />
      
      <DeleteAction 
        noteId={noteId} 
        onDelete={handleDelete} 
      />
    </>
  );
};
