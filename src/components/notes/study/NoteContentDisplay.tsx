
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";
import { Note } from "@/types/note";
import { TextAlignType } from "./hooks/useStudyViewState";
import { EnhancementTabs } from "./EnhancementTabs";

interface NoteContentDisplayProps {
  note: Note;
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  isEditing?: boolean;
}

export const NoteContentDisplay = ({ 
  note,
  content, 
  fontSize, 
  textAlign,
  isEditing = false
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
    <EnhancementTabs
      note={note}
      fontSize={fontSize}
      textAlign={textAlign}
      isEditing={isEditing}
    />
  );
};
