
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
  isDeleting?: boolean;
}

export const NoteCardActions = ({
  noteId,
  noteTitle,
  noteContent = "",
  isPinned,
  onPin,
  onDelete,
  iconSize = 4,
  isDeleting = false
}: NoteCardActionsProps) => {
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
        onDelete={onDelete}
        iconSize={iconSize}
        isDeleting={isDeleting}
      />
    </div>
  );
};
