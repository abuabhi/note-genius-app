
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UnifiedDeleteAction } from "../UnifiedDeleteAction";

interface DeleteActionProps {
  noteId: string;
  noteTitle: string;
  onDelete: (id: string) => Promise<void>;
}

export const DeleteAction = ({ noteId, noteTitle, onDelete }: DeleteActionProps) => {
  return (
    <DropdownMenuItem asChild>
      <UnifiedDeleteAction 
        noteId={noteId}
        noteTitle={noteTitle}
        onDelete={onDelete}
        variant="dropdown"
      />
    </DropdownMenuItem>
  );
};
