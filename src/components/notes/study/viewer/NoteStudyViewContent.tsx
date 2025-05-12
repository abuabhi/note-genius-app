
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { NoteContentDisplay } from "../NoteContentDisplay";
import { NoteStudyEditForm } from "../editor/NoteStudyEditForm";
import { EnhancementUsageMeter } from "./EnhancementUsageMeter";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";

interface NoteStudyViewContentProps {
  note: Note;
  isEditing: boolean;
  fontSize: number;
  textAlign: TextAlignType;
  editableContent: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  isSaving: boolean;
  statsLoading?: boolean;
  currentUsage?: number;
  monthlyLimit?: number | null;
  handleContentChange: (html: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  handleEnhanceContent: (enhancedContent: string) => void;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
  handleRetryEnhancement: (enhancementType: string) => Promise<void>;
  hasReachedLimit?: () => boolean;
  fetchUsageStats?: () => Promise<void>;
}

export const NoteStudyViewContent: React.FC<NoteStudyViewContentProps> = ({
  note,
  isEditing,
  fontSize,
  textAlign,
  editableContent,
  selectedTags,
  availableTags,
  isSaving,
  statsLoading = false,
  currentUsage = 0,
  monthlyLimit = null,
  handleContentChange,
  handleSaveContent,
  toggleEditing,
  handleEnhanceContent,
  setSelectedTags,
  handleRetryEnhancement,
  hasReachedLimit = () => false,
  fetchUsageStats = async () => {}
}) => {
  const [enhancementLoading, setEnhancementLoading] = useState<boolean>(false);

  // Wrapper for retry enhancement to manage loading state
  const onRetryEnhancement = async (enhancementType: string) => {
    setEnhancementLoading(true);
    try {
      await handleRetryEnhancement(enhancementType);
    } finally {
      setEnhancementLoading(false);
    }
  };

  return (
    <CardContent className="p-4 md:p-6">
      {/* Show usage meter when not editing */}
      {!isEditing && (
        <EnhancementUsageMeter 
          statsLoading={statsLoading}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
        />
      )}
      
      {isEditing ? (
        <NoteStudyEditForm
          note={note}
          editableContent={editableContent}
          selectedTags={selectedTags}
          availableTags={availableTags}
          isSaving={isSaving}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContent}
          setSelectedTags={setSelectedTags}
        />
      ) : (
        <NoteContentDisplay
          note={note}
          content={note.content || ''}
          fontSize={fontSize}
          textAlign={textAlign}
          isEditing={isEditing}
          isLoading={enhancementLoading}
          onRetryEnhancement={onRetryEnhancement}
        />
      )}
    </CardContent>
  );
};
