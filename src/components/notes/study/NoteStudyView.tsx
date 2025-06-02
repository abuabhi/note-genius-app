
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNotes } from "@/contexts/NoteContext";
import { useEffect, useState } from "react";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const viewState = useStudyViewState();
  const { currentUsage, monthlyLimit, hasReachedLimit } = useNoteEnrichment();
  const { notes, updateNote } = useNotes();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get the most up-to-date note data from context
  const currentNote = notes.find(n => n.id === note.id) || note;
  
  // Force refresh function
  const forceRefresh = () => {
    console.log("🔄 Forcing component refresh");
    setRefreshKey(prev => prev + 1);
  };

  const editorState = useNoteStudyEditor(currentNote);
  
  // Debug note updates with more comprehensive logging
  useEffect(() => {
    console.log("📊 NoteStudyView - Note data tracking:", {
      originalNoteId: note.id,
      currentNoteId: currentNote.id,
      timestamp: new Date().toISOString(),
      refreshKey,
      noteComparison: {
        original: {
          improved_content: !!note.improved_content,
          improved_content_length: note.improved_content?.length || 0,
          summary: !!note.summary,
          key_points: !!note.key_points,
          markdown_content: !!note.markdown_content
        },
        current: {
          improved_content: !!currentNote.improved_content,
          improved_content_length: currentNote.improved_content?.length || 0,
          summary: !!currentNote.summary,
          key_points: !!currentNote.key_points,
          markdown_content: !!currentNote.markdown_content
        }
      },
      enhancementTimestamps: {
        summary: currentNote.summary_generated_at,
        keyPoints: currentNote.key_points_generated_at,
        improvedClarity: currentNote.improved_content_generated_at,
        markdown: currentNote.markdown_content_generated_at
      },
      rawContent: {
        improved_content: currentNote.improved_content?.substring(0, 100) || 'none',
        summary: currentNote.summary?.substring(0, 100) || 'none',
        key_points: currentNote.key_points?.substring(0, 100) || 'none'
      }
    });
  }, [note, currentNote, refreshKey]);

  const handleRetryEnhancement = async (enhancementType: string): Promise<void> => {
    console.log("🔄 Retrying enhancement:", enhancementType);
    // Implementation for retrying enhancement
  };

  // Enhanced update handler that forces refresh
  const handleNoteUpdate = async (updatedData: Partial<Note>) => {
    try {
      console.log("🎯 NoteStudyView - Handling note update:", updatedData);
      await updateNote(currentNote.id, updatedData);
      
      // Force a refresh to ensure UI updates
      setTimeout(() => {
        forceRefresh();
      }, 100);
    } catch (error) {
      console.error("❌ Error updating note:", error);
    }
  };

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
