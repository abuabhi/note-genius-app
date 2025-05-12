
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
}

export const NoteContentDisplay = ({ 
  note,
  content, 
  fontSize, 
  textAlign,
  isEditing = false,
  isLoading = false,
  onRetryEnhancement
}: NoteContentDisplayProps) => {
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
  
  return (
    <TwoColumnEnhancementView
      note={note}
      fontSize={fontSize}
      textAlign={textAlign}
      isEditing={isEditing}
      isLoading={isLoading}
      onRetryEnhancement={onRetryEnhancement}
    />
  );
};
