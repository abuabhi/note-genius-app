
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNotes } from "@/contexts/NoteContext";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const viewState = useStudyViewState();
  const editorState = useNoteStudyEditor(note);
  const { currentUsage, monthlyLimit, hasReachedLimit } = useNoteEnrichment();
  const { notes } = useNotes();
  
  // Get the most up-to-date note data from context
  const currentNote = notes.find(n => n.id === note.id) || note;
  
  console.log("NoteStudyView - Note data comparison:", {
    originalNoteId: note.id,
    currentNoteId: currentNote.id,
    originalHasKeyPoints: !!note.key_points,
    currentHasKeyPoints: !!currentNote.key_points,
    originalUpdatedAt: note.updated_at,
    currentUpdatedAt: currentNote.updated_at,
    keyPointsLength: currentNote.key_points?.length || 0
  });

  const handleRetryEnhancement = async (enhancementType: string): Promise<void> => {
    // Implementation for retrying enhancement
    console.log("Retrying enhancement:", enhancementType);
  };

  return (
    <div className={`mx-auto transition-all duration-300 ${
      viewState.isFullWidth ? 'max-w-full' : 'max-w-4xl'
    } ${viewState.isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className="shadow-lg border-mint-200">
        <StudyViewHeader
          note={currentNote}
          fontSize={viewState.fontSize}
          textAlign={viewState.textAlign}
          isFullWidth={viewState.isFullWidth}
          isFullScreen={viewState.isFullScreen}
          isEditing={editorState.isEditing}
          isSaving={editorState.isSaving}
          editableTitle={editorState.editableTitle}
          onIncreaseFontSize={viewState.handleIncreaseFontSize}
          onDecreaseFontSize={viewState.handleDecreaseFontSize}
          onChangeTextAlign={viewState.handleTextAlign}
          onToggleWidth={viewState.toggleWidth}
          onToggleFullScreen={viewState.toggleFullScreen}
          onToggleEditing={editorState.toggleEditing}
          onSave={editorState.handleSaveContent}
          onTitleChange={editorState.handleTitleChange}
          onEnhance={editorState.handleEnhanceContent}
        />
        
        <NoteStudyViewContent
          note={currentNote}
          isEditing={editorState.isEditing}
          fontSize={viewState.fontSize}
          textAlign={viewState.textAlign}
          editableContent={editorState.editableContent}
          selectedTags={editorState.selectedTags}
          availableTags={editorState.availableTags}
          isSaving={editorState.isSaving}
          currentUsage={currentUsage}
          monthlyLimit={monthlyLimit}
          handleContentChange={editorState.handleContentChange}
          handleSaveContent={editorState.handleSaveContent}
          toggleEditing={editorState.toggleEditing}
          handleEnhanceContent={editorState.handleEnhanceContent}
          setSelectedTags={editorState.setSelectedTags}
          handleRetryEnhancement={handleRetryEnhancement}
          hasReachedLimit={hasReachedLimit}
          fetchUsageStats={async () => {}}
        />
      </Card>
    </div>
  );
};
