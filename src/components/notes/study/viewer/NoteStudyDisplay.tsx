
import React from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from '../hooks/useStudyViewState';
import { SimpleEnhancementTabs } from '../SimpleEnhancementTabs';

interface NoteStudyDisplayProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  onNoteUpdate?: () => void;
}

export const NoteStudyDisplay: React.FC<NoteStudyDisplayProps> = ({
  note,
  fontSize,
  textAlign,
  onNoteUpdate
}) => {
  return (
    <div className="h-full">
      <SimpleEnhancementTabs
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        onNoteUpdate={onNoteUpdate}
      />
    </div>
  );
};
