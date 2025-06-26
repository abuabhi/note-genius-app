
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NoteActionsMenu } from "./actions/NoteActionsMenu";

interface NoteCardActionsProps {
  noteId: string;
  noteTitle: string;
  noteContent?: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
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
  const handleDelete = async (id: string) => {
    console.log("NoteCardActions - Starting delete for note ID:", id);
    try {
      await onDelete(id);
      console.log("NoteCardActions - Delete completed for note ID:", id);
    } catch (error) {
      console.error("NoteCardActions - Delete failed for note ID:", id, error);
      throw error;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className={`h-${iconSize} w-${iconSize}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200/60">
        <NoteActionsMenu
          noteId={noteId}
          noteTitle={noteTitle}
          noteContent={noteContent}
          isPinned={isPinned}
          onPin={onPin}
          onDelete={handleDelete}
          iconSize={iconSize}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
