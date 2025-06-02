
import { useState } from "react";
import { CardHeader } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewControls } from "../controls/StudyViewControls";
import { TextAlignType } from "../hooks/useStudyViewState";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { toast } from "sonner";
import { StudyViewTitleSection } from "./StudyViewTitleSection";
import { StudyViewProcessingIndicator } from "./StudyViewProcessingIndicator";
import { StudyViewEnhancementDropdown } from "./StudyViewEnhancementDropdown";
import { StudyViewExportDropdown } from "./StudyViewExportDropdown";

interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editableTitle: string;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onEnhance: (enhancedContent: string, enhancementType?: EnhancementFunction) => void;
}

export const StudyViewHeader = ({
  note,
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing,
  isSaving,
  editableTitle,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave,
  onTitleChange,
  onEnhance,
}: StudyViewHeaderProps) => {
  const [processingEnhancement, setProcessingEnhancement] = useState<EnhancementFunction | null>(null);
  const { enrichNote, enhancementOptions } = useNoteEnrichment();

  // Handle enhancement selection
  const handleEnhancementSelect = async (enhancement: EnhancementFunction) => {
    setProcessingEnhancement(enhancement);
    
    try {
      const originalContent = note.content || note.description || "";
      const result = await enrichNote(note.id, originalContent, enhancement, note.title || "");
      
      if (result.success) {
        onEnhance(result.content, enhancement);
        toast.success(`${enhancementOptions.find(opt => opt.value === enhancement)?.title} completed successfully!`);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
    } finally {
      setProcessingEnhancement(null);
    }
  };

  return (
    <CardHeader className="border-b p-4 bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          <StudyViewTitleSection
            note={note}
            isEditing={isEditing}
            editableTitle={editableTitle}
            onTitleChange={onTitleChange}
          />
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <StudyViewProcessingIndicator processingEnhancement={processingEnhancement} />
              
              <StudyViewEnhancementDropdown
                note={note}
                processingEnhancement={processingEnhancement}
                onEnhancementSelect={handleEnhancementSelect}
              />
              
              <StudyViewExportDropdown note={note} />
            </>
          )}

          <StudyViewControls
            fontSize={fontSize}
            textAlign={textAlign}
            isFullWidth={isFullWidth}
            isFullScreen={isFullScreen}
            isEditing={isEditing}
            isSaving={isSaving}
            hideAlignment={true}
            onIncreaseFontSize={onIncreaseFontSize}
            onDecreaseFontSize={onDecreaseFontSize}
            onChangeTextAlign={onChangeTextAlign}
            onToggleWidth={onToggleWidth}
            onToggleFullScreen={onToggleFullScreen}
            onToggleEditing={onToggleEditing}
            onSave={onSave}
          />
        </div>
      </div>
    </CardHeader>
  );
};
