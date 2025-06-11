
import React from 'react';
import { Note } from '@/types/note';
import { EnhancementDisplayPanel } from '../enhancements/EnhancementDisplayPanel';
import { TextAlignType } from '../hooks/useStudyViewState';

interface NoteStudyDisplayProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  statsLoading: boolean;
  currentUsage: number;
  monthlyLimit: number;
  handleEnhanceContent: (enhancementType: string) => void;
  handleRetryEnhancement: (enhancementType: string) => void;
  hasReachedLimit: boolean;
  fetchUsageStats: () => void;
  onNoteUpdate: (updatedData: Partial<Note>) => void;
  activeContentType: string;
  onActiveContentTypeChange: (type: string) => void;
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
