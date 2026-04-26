
import React from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from '../hooks/useStudyViewState';
import { SimpleEnhancementTabs } from '../SimpleEnhancementTabs';
import { EnhancementType } from '@/types/enhancement';

interface NoteStudyDisplayProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  onNoteUpdate?: () => void;
  activeContentType?: string;
  onActiveContentTypeChange?: (type: string) => void;
}

export const NoteStudyDisplay: React.FC<NoteStudyDisplayProps> = ({
  note,
  fontSize,
  textAlign,
  onNoteUpdate,
  activeContentType,
  onActiveContentTypeChange
}) => {
  return (
    <div className="h-full">
      <SimpleEnhancementTabs
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        onNoteUpdate={onNoteUpdate}
        activeContentType={activeContentType as EnhancementType | undefined}
        onActiveContentTypeChange={onActiveContentTypeChange as ((value: EnhancementType) => void) | undefined}
      />
    </div>
  );
};
