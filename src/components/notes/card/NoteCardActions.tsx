
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
  return (
    <div 
      className="absolute top-2 right-2"
      onClick={(e) => {
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
      />
    </div>
  );
};
