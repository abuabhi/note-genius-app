
import React from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from '../hooks/useStudyViewState';
import { OptimizedTwoColumnView } from '../enhancements/OptimizedTwoColumnView';
import { EnhancementContentType } from '../enhancements/EnhancementSelector';

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
  // Convert activeContentType string to EnhancementContentType
  const contentType = activeContentType as EnhancementContentType;
  
  // Create a no-op function for setActiveContentType since it's handled at parent level
  const handleActiveContentTypeChange = () => {
    // This is handled by the parent component through activeContentType prop
  };

  return (
    <div className="space-y-6">
      <OptimizedTwoColumnView
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        activeContentType={contentType}
        setActiveContentType={handleActiveContentTypeChange}
        onRetryEnhancement={handleRetryEnhancement}
        isEditOperation={isEditOperation}
      />
    </div>
  );
};
