
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
import { useCallback, useRef } from "react";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const viewState = useStudyViewState();
  const { currentUsage, monthlyLimit, hasReachedLimit, isLoading: statsLoading } = useNoteEnrichment();
  
  // Real-time note synchronization
  const { currentNote, refreshKey, forceRefresh, setRealtimeNote } = useRealtimeNoteSync(note);
  
  // Enhancement retry functionality
  const { handleRetryEnhancement, isEnhancing } = useNoteEnhancementRetry(currentNote, forceRefresh);
  
  // Note update handling with tab preservation
  const { handleNoteUpdate } = useNoteUpdateHandler(currentNote, forceRefresh, setRealtimeNote);
  
  // Prevent automatic summary generation
  useAutomaticSummaryPrevention(currentNote, refreshKey);
  
  // Editor state
  const editorState = useNoteStudyEditor(currentNote);

  // Track if we're in an edit operation to prevent auto-switching
  const isEditOperationRef = useRef(false);

  // FIXED: Enhanced note update handler that completely prevents tab switching during edit operations
  const handleNoteUpdateWithTabPreservation = useCallback(async (updatedData: Partial<Note>) => {
    console.log("🎯 NoteStudyView - Starting edit operation with tab preservation:", {
      currentTab: viewState.activeContentType,
      noteId: currentNote.id,
      updatedFields: Object.keys(updatedData)
    });
    
    // Mark that we're in an edit operation to prevent any auto-switching
    isEditOperationRef.current = true;
    
    // Store the current active tab before update
    const preservedTab = viewState.activeContentType;
    
    try {
      await handleNoteUpdate(updatedData);
      
      // Ensure we stay on the same tab after the update
      console.log("🔒 Enforcing tab preservation after edit:", preservedTab);
      viewState.setActiveContentType(preservedTab);
      
    } finally {
      // Reset the edit operation flag after a delay to allow for UI updates
      setTimeout(() => {
        isEditOperationRef.current = false;
        console.log("✅ Edit operation completed, auto-switching re-enabled");
      }, 1000); // Longer delay to ensure all updates are processed
    }
  }, [viewState.activeContentType, viewState.setActiveContentType, handleNoteUpdate, currentNote.id]);

  console.log("📊 NoteStudyView - Current state:", {
    noteId: currentNote.id,
    activeTab: viewState.activeContentType,
    isEditing: editorState.isEditing,
    isEditOperation: isEditOperationRef.current,
    refreshKey,
    hasEnhancements: {
      summary: !!currentNote.summary,
      keyPoints: !!currentNote.key_points,
      improved: !!currentNote.improved_content,
      markdown: !!currentNote.markdown_content
    }
  });

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
          statsLoading={statsLoading}
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
          onNoteUpdate={handleNoteUpdateWithTabPreservation}
          activeContentType={viewState.activeContentType}
          onActiveContentTypeChange={viewState.setActiveContentType}
          isEditOperation={isEditOperationRef.current}
        />
      </Card>
    </div>
  );
};
