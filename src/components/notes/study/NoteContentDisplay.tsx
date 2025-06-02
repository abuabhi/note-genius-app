
import { useState, useCallback } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { TwoColumnEnhancementView } from "./enhancements/TwoColumnEnhancementView";
import { EnhancementContentType } from "./enhancements/EnhancementSelector";

interface NoteContentDisplayProps {
  note: Note;
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  isEditing: boolean;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => Promise<void>;
  onCancelEnhancement?: () => void;
  activeContentType?: EnhancementContentType;
  onActiveContentTypeChange?: (type: EnhancementContentType) => void;
}

export const NoteContentDisplay = ({
  note,
  content,
  fontSize,
  textAlign,
  isEditing,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement,
  activeContentType = 'original',
  onActiveContentTypeChange
}: NoteContentDisplayProps) => {
  const [localActiveContentType, setLocalActiveContentType] = useState<EnhancementContentType>(activeContentType);

  // Handle tab change - preserve the active tab
  const handleActiveContentTypeChange = useCallback((type: EnhancementContentType) => {
    setLocalActiveContentType(type);
    onActiveContentTypeChange?.(type);
  }, [onActiveContentTypeChange]);

  return (
    <div className="note-content-display">
      <TwoColumnEnhancementView
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        activeContentType={localActiveContentType}
        setActiveContentType={handleActiveContentTypeChange}
        isLoading={isLoading}
        onRetryEnhancement={onRetryEnhancement}
        onCancelEnhancement={onCancelEnhancement}
      />
    </div>
  );
};
