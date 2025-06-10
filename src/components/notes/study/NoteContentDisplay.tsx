
import { useState, useCallback } from "react";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { OptimizedTwoColumnView } from "./enhancements/OptimizedTwoColumnView";
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

  console.log("🎯 NoteContentDisplay - UNIFIED RENDERING PATH - ALL MARKDOWN:", {
    noteId: note.id,
    activeContentType: localActiveContentType,
    isEditing,
    isLoading
  });

  return (
    <div className="note-content-display">
      <OptimizedTwoColumnView
        note={note}
        fontSize={fontSize}
        textAlign={textAlign}
        activeContentType={localActiveContentType}
        setActiveContentType={handleActiveContentTypeChange}
        onRetryEnhancement={onRetryEnhancement}
        isEditOperation={isLoading}
      />
    </div>
  );
};
