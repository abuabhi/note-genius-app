
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { NoteContentDisplay } from "../NoteContentDisplay";
import { NoteStudyEditForm } from "../editor/NoteStudyEditForm";
import { EnhancementUsageMeter } from "./EnhancementUsageMeter";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { toast } from "sonner";

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
  onNoteUpdate?: (updatedData: Partial<Note>) => Promise<void>;
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
  fetchUsageStats = async () => {},
  onNoteUpdate
}) => {
  const [enhancementLoading, setEnhancementLoading] = useState<boolean>(false);
  const [currentEnhancementType, setCurrentEnhancementType] = useState<string>("");
  const { enrichNote } = useNoteEnrichment();

  // Wrapper for retry enhancement to manage loading state
  const onRetryEnhancement = async (enhancementType: string) => {
    setEnhancementLoading(true);
    setCurrentEnhancementType(enhancementType);
    try {
      await handleRetryEnhancement(enhancementType);
    } catch (error) {
      console.error('Retry enhancement failed:', error);
      toast.error('Failed to retry enhancement. Please try again.');
    } finally {
      setEnhancementLoading(false);
      setCurrentEnhancementType("");
    }
  };

  // Handle canceling enhancement
  const onCancelEnhancement = () => {
    setEnhancementLoading(false);
    setCurrentEnhancementType("");
    toast.info('Enhancement canceled');
  };

  console.log("NoteStudyViewContent rendering with note:", { 
    id: note.id, 
    isEditing,
    hasSummary: !!note.summary,
    hasKeyPoints: !!note.key_points,
    enhancementLoading,
    currentEnhancementType
  });

  return (
    <CardContent className="p-4 md:p-6">
      {/* Always show usage meter at the top */}
      <div className="mb-4">
        <EnhancementUsageMeter 
          statsLoading={statsLoading}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
        />
      </div>
      
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
          onCancelEnhancement={onCancelEnhancement}
        />
      )}
    </CardContent>
  );
};
