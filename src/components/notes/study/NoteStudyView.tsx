
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNotes } from "@/contexts/NoteContext";
import { useEffect } from "react";

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
  
  // Debug note updates
  useEffect(() => {
    console.log("📊 NoteStudyView - Note data tracking:", {
      originalNoteId: note.id,
      currentNoteId: currentNote.id,
      timestamp: new Date().toISOString(),
      changes: {
        summary: {
          original: !!note.summary,
          current: !!currentNote.summary,
          changed: note.summary !== currentNote.summary
        },
        keyPoints: {
          original: !!note.key_points,
          current: !!currentNote.key_points,
          changed: note.key_points !== currentNote.key_points
        },
        improvedClarity: {
          original: !!note.improved_content,
          current: !!currentNote.improved_content,
          changed: note.improved_content !== currentNote.improved_content
        },
        markdown: {
          original: !!note.markdown_content,
          current: !!currentNote.markdown_content,
          changed: note.markdown_content !== currentNote.markdown_content
        }
      },
      enhancementTimestamps: {
        summary: currentNote.summary_generated_at,
        keyPoints: currentNote.key_points_generated_at,
        improvedClarity: currentNote.improved_content_generated_at,
        markdown: currentNote.markdown_content_generated_at
      }
    });
  }, [note, currentNote]);

  const handleRetryEnhancement = async (enhancementType: string): Promise<void> => {
    console.log("🔄 Retrying enhancement:", enhancementType);
    // Implementation for retrying enhancement
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
