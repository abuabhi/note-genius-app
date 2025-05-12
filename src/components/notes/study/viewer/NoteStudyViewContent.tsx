
import React from "react";
import { EnhanceNoteButton } from "../../enrichment/EnhanceNoteButton";
import { NoteContentDisplay } from "../NoteContentDisplay";
import { TextAlignType } from "../hooks/useStudyViewState";
import { Note } from "@/types/note";

interface NoteStudyViewContentProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  handleEnhanceContent: (enhancedContent: string) => void;
}

export const NoteStudyViewContent: React.FC<NoteStudyViewContentProps> = ({
  note,
  fontSize,
  textAlign,
  handleEnhanceContent
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EnhanceNoteButton
          noteId={note.id}
          noteTitle={note.title}
          noteContent={note.content || ''}
          onEnhance={handleEnhanceContent}
        />
      </div>
      <NoteContentDisplay
        note={note}
        content={note.content || ''}
        fontSize={fontSize}
        textAlign={textAlign}
      />
    </div>
  );
};
