
import React from "react";
import { NoteActionsMenu } from "./actions/NoteActionsMenu";

interface NoteCardActionsProps {
  noteId: string;
  noteTitle: string;
  noteContent?: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
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
    <div 
      className="absolute top-2 right-2"
      onClick={(e) => {
        // Make sure we prevent bubbling up on any click in the actions area
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <NoteActionsMenu
        noteId={noteId}
        noteTitle={noteTitle}
        noteContent={noteContent}
        isPinned={isPinned}
        onPin={onPin}
        onDelete={handleDelete}
        iconSize={iconSize}
      />
    </div>
  );
};
