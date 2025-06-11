
import React from 'react';
import { Note } from '@/types/note';
import { EnhancementDisplayPanel } from '../enhancements/EnhancementDisplayPanel';
import { TextAlignType } from '../hooks/useStudyViewState';

interface NoteStudyDisplayProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  handleRetryEnhancement: (enhancementType: string) => Promise<void>;
  activeContentType: string;
  isEditOperation: boolean;
}

export const NoteStudyDisplay: React.FC<NoteStudyDisplayProps> = ({
  note,
  fontSize,
  textAlign,
  activeContentType,
  handleRetryEnhancement,
  isEditOperation
}) => {
  return (
    <div className="space-y-6">
      <EnhancementDisplayPanel
        note={note}
        contentType={activeContentType as any}
        fontSize={fontSize}
        textAlign={textAlign}
        isLoading={isEditOperation}
        onRetryEnhancement={handleRetryEnhancement}
      />
    </div>
  );
};
