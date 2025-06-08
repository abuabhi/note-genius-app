
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementContentType } from "../enhancements/EnhancementSelector";
import { OptimizedTwoColumnView } from "../enhancements/OptimizedTwoColumnView";
import { NoteStudyEditForm } from "../editor/NoteStudyEditForm";
import { EnhancementUsageMeter } from "./EnhancementUsageMeter";

interface NoteStudyViewContentProps {
  note: Note;
  isEditing: boolean;
  fontSize: number;
  textAlign: TextAlignType;
  editableContent: string;
  selectedTags: string[];
  availableTags: string[];
  isSaving: boolean;
  statsLoading: boolean;
  currentUsage: number;
  monthlyLimit: number;
  handleContentChange: (content: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  handleEnhanceContent: (enhancementType: string) => Promise<void>;
  setSelectedTags: (tags: string[]) => void;
  handleRetryEnhancement: (enhancementType: string) => Promise<void>;
  hasReachedLimit: boolean;
  fetchUsageStats: () => Promise<void>;
  onNoteUpdate: (data: Partial<Note>) => Promise<void>;
  activeContentType: EnhancementContentType;
  onActiveContentTypeChange: (type: EnhancementContentType) => void;
  isEditOperation: boolean;
}

export const NoteStudyViewContent = ({
  note,
  isEditing,
  fontSize,
  textAlign,
  editableContent,
  selectedTags,
  availableTags,
  isSaving,
  currentUsage,
  monthlyLimit,
  handleContentChange,
  handleSaveContent,
  toggleEditing,
  handleEnhanceContent,
  setSelectedTags,
  handleRetryEnhancement,
  hasReachedLimit,
  activeContentType,
  onActiveContentTypeChange,
  isEditOperation
}: NoteStudyViewContentProps) => {

  return (
    <div className="p-6 space-y-6">
      {/* Usage Meter */}
      <EnhancementUsageMeter
        currentUsage={currentUsage}
        monthlyLimit={monthlyLimit}
        hasReachedLimit={hasReachedLimit}
      />

      {/* Main Content Area */}
      {isEditing ? (
        <NoteStudyEditForm
          editableContent={editableContent}
          selectedTags={selectedTags}
          availableTags={availableTags}
          isSaving={isSaving}
          onContentChange={handleContentChange}
          onSave={handleSaveContent}
          onCancel={toggleEditing}
          onTagsChange={setSelectedTags}
        />
      ) : (
        <OptimizedTwoColumnView
          note={note}
          fontSize={fontSize}
          textAlign={textAlign}
          activeContentType={activeContentType}
          setActiveContentType={onActiveContentTypeChange}
          onRetryEnhancement={handleRetryEnhancement}
          isEditOperation={isEditOperation}
        />
      )}
    </div>
  );
};
