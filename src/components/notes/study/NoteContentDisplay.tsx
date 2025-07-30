import React from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { SimpleEnhancementTabs } from "./SimpleEnhancementTabs";

interface NoteContentDisplayProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  onNoteUpdate?: () => void;
}

export const NoteContentDisplay: React.FC<NoteContentDisplayProps> = ({
  note,
  fontSize,
  textAlign,
  onNoteUpdate
}) => {
  return (
    <div className="note-content-display h-full">
      <SimpleEnhancementTabs
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        onNoteUpdate={onNoteUpdate}
      />
    </div>
  );
};