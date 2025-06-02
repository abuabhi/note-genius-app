
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { TwoColumnEnhancementView } from "./enhancements/TwoColumnEnhancementView";

interface NoteContentDisplayProps {
  note: Note;
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  isEditing?: boolean;
  isLoading?: boolean;
  onRetryEnhancement?: (enhancementType: string) => void;
  onCancelEnhancement?: () => void;
}

export const NoteContentDisplay = ({ 
  note,
  content, 
  fontSize, 
  textAlign,
  isEditing = false,
  isLoading = false,
  onRetryEnhancement,
  onCancelEnhancement
}: NoteContentDisplayProps) => {
  // Debug log to trace what's happening
  console.log("NoteContentDisplay rendering with:", {
    noteId: note?.id,
    hasSummary: !!note?.summary,
    hasKeyPoints: !!note?.key_points,
    hasMarkdown: !!note?.markdown_content,
    hasImproved: !!note?.improved_content,
    summaryGeneratedAt: note?.summary_generated_at,
    isEditing,
    isLoading
  });
  
  // If no note is provided, fall back to the simple display
  if (!note) {
    return (
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign} 
      />
    );
  }
  
  // If editing, just show the original content with rich text display
  if (isEditing) {
    return (
      <RichTextDisplay 
        content={content} 
        fontSize={fontSize} 
        textAlign={textAlign} 
      />
    );
  }
  
  // Always use the TwoColumnEnhancementView when not editing
  // This ensures we see the tab interface even if there are no enhancements yet
  return (
    <TwoColumnEnhancementView
      note={note}
      fontSize={fontSize}
      textAlign={textAlign}
      isEditing={isEditing}
      isLoading={isLoading}
      onRetryEnhancement={onRetryEnhancement}
      onCancelEnhancement={onCancelEnhancement}
    />
  );
};
