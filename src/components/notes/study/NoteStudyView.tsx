
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useRealtimeNoteSync } from "./hooks/useRealtimeNoteSync";
import { useNoteEnhancementRetry } from "./hooks/useNoteEnhancementRetry";
import { useNoteUpdateHandler } from "./hooks/useNoteUpdateHandler";
import { useAutomaticSummaryPrevention } from "./hooks/useAutomaticSummaryPrevention";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const viewState = useStudyViewState();
  const { currentUsage, monthlyLimit, hasReachedLimit } = useNoteEnrichment();
  
  // Real-time note synchronization
  const { currentNote, refreshKey, forceRefresh, setRealtimeNote } = useRealtimeNoteSync(note);
  
  // Enhancement retry functionality
  const { handleRetryEnhancement, isEnhancing } = useNoteEnhancementRetry(currentNote, forceRefresh);
  
  // Note update handling
  const { handleNoteUpdate } = useNoteUpdateHandler(currentNote, forceRefresh, setRealtimeNote);
  
  // Prevent automatic summary generation
  useAutomaticSummaryPrevention(currentNote, refreshKey);
  
  // Editor state
  const editorState = useNoteStudyEditor(currentNote);

  return (
    <div 
      key={`note-study-${currentNote.id}-${refreshKey}`}
      className={`mx-auto transition-all duration-300 ${
        viewState.isFullWidth ? 'max-w-full' : 'max-w-4xl'
      } ${viewState.isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
    >
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
          onNoteUpdate={handleNoteUpdate}
        />
      </Card>
    </div>
  );
};
