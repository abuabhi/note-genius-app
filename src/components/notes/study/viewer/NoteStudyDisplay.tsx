
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
  onActiveContentTypeChange: (type: string) => void;
  isEditOperation: boolean;
}

export const NoteStudyDisplay: React.FC<NoteStudyDisplayProps> = ({
  note,
  fontSize,
  textAlign,
  activeContentType,
  onActiveContentTypeChange,
  handleRetryEnhancement,
  isEditOperation
}) => {
  // Convert activeContentType string to EnhancementContentType
  const contentType = activeContentType as EnhancementContentType;
  
  // Handle content type changes
  const handleActiveContentTypeChange = (type: EnhancementContentType) => {
    onActiveContentTypeChange(type);
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
