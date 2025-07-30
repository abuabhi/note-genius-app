
import React from 'react';
import { Note } from '@/types/note';
import { TextAlignType } from '../hooks/useStudyViewState';
import { OptimizedTwoColumnView } from '../enhancements/OptimizedTwoColumnView';
import { EnhancementContentType } from '../enhancements/EnhancementSelector';

interface NoteStudyDisplayProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  handleGenerateEnhancement: (enhancementType: string) => Promise<void>;
  activeContentType: string;
  onActiveContentTypeChange: (type: string) => void;
  isEditOperation: boolean;
  processingStage?: string;
  headerProcessingEnhancement?: string | null;
  // Enhancement status props
  isEnhancing?: boolean;
  isStuck?: boolean;
  lastRequestTime?: number | null;
  retryCount?: number;
  onForceReset?: () => void;
  processingTime?: number;
  enhancementStartTime?: number | null;
}

export const NoteStudyDisplay: React.FC<NoteStudyDisplayProps> = ({
  note,
  fontSize,
  textAlign,
  activeContentType,
  onActiveContentTypeChange,
  handleGenerateEnhancement,
  isEditOperation,
  processingStage,
  headerProcessingEnhancement,
  isEnhancing,
  isStuck,
  lastRequestTime,
  retryCount,
  onForceReset,
  processingTime,
  enhancementStartTime
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
        onGenerateEnhancement={handleGenerateEnhancement}
        isEditOperation={isEditOperation}
        processingStage={processingStage}
        headerProcessingEnhancement={headerProcessingEnhancement}
        isEnhancing={isEnhancing}
        isStuck={isStuck}
        lastRequestTime={lastRequestTime}
        retryCount={retryCount}
        onForceReset={onForceReset}
        processingTime={processingTime}
        enhancementStartTime={enhancementStartTime}
      />
    </div>
  );
};
