
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewHeader } from "./header/StudyViewHeader";
import { NoteStudyViewContent } from "./viewer/NoteStudyViewContent";
import { useStudyViewState } from "./hooks/useStudyViewState";
import { useNoteStudyEditor } from "./hooks/useNoteStudyEditor";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNotes } from "@/contexts/NoteContext";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NoteStudyViewProps {
  note: Note;
}

export const NoteStudyView = ({ note }: NoteStudyViewProps) => {
  const viewState = useStudyViewState();
  const { currentUsage, monthlyLimit, hasReachedLimit } = useNoteEnrichment();
  const { notes, updateNote, setNotes } = useNotes();
  const [refreshKey, setRefreshKey] = useState(0);
  const [realtimeNote, setRealtimeNote] = useState<Note>(note);
  
  // Get the most up-to-date note data from context or realtime updates
  const currentNote = notes.find(n => n.id === note.id) || realtimeNote;
  
  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forcing component refresh");
    setRefreshKey(prev => prev + 1);
  }, []);

  // Set up real-time subscription for note updates
  useEffect(() => {
    console.log("📡 Setting up real-time subscription for note:", note.id);
    
    const channel = supabase
      .channel(`note_${note.id}_changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${note.id}`
        },
        (payload) => {
          console.log("📡 Real-time note update received:", {
            noteId: note.id,
            newData: payload.new,
            enhancementFields: {
              improved_content: !!payload.new.improved_content,
              summary: !!payload.new.summary,
              key_points: !!payload.new.key_points,
              markdown_content: !!payload.new.markdown_content
            }
          });
          
          // Create updated note object maintaining the type structure
          const updatedNote: Note = {
            ...currentNote,
            ...payload.new,
            // Ensure proper date formatting
            date: new Date(payload.new.date).toISOString().split('T')[0],
            // Map subject to category for backward compatibility
            category: payload.new.subject || currentNote.category || 'Uncategorized',
            // Ensure tags are preserved
            tags: currentNote.tags || []
          };
          
          setRealtimeNote(updatedNote);
          
          // Update the notes context as well
          setNotes(prevNotes => 
            prevNotes.map(n => n.id === note.id ? updatedNote : n)
          );
          
          // Force a UI refresh
          forceRefresh();
        }
      )
      .subscribe();

    return () => {
      console.log("📡 Cleaning up real-time subscription for note:", note.id);
      supabase.removeChannel(channel);
    };
  }, [note.id, currentNote, setNotes, forceRefresh]);

  const editorState = useNoteStudyEditor(currentNote);
  
  // Enhanced debug logging with more comprehensive note tracking
  useEffect(() => {
    console.log("📊 NoteStudyView - Enhanced note data tracking:", {
      originalNoteId: note.id,
      currentNoteId: currentNote.id,
      timestamp: new Date().toISOString(),
      refreshKey,
      realtimeUpdateCount: refreshKey,
      noteComparison: {
        original: {
          improved_content: !!note.improved_content,
          improved_content_length: note.improved_content?.length || 0,
          summary: !!note.summary,
          key_points: !!note.key_points,
          markdown_content: !!note.markdown_content,
          summary_status: note.summary_status
        },
        current: {
          improved_content: !!currentNote.improved_content,
          improved_content_length: currentNote.improved_content?.length || 0,
          summary: !!currentNote.summary,
          key_points: !!currentNote.key_points,
          markdown_content: !!currentNote.markdown_content,
          summary_status: currentNote.summary_status
        },
        realtime: {
          improved_content: !!realtimeNote.improved_content,
          improved_content_length: realtimeNote.improved_content?.length || 0,
          summary: !!realtimeNote.summary,
          key_points: !!realtimeNote.key_points,
          markdown_content: !!realtimeNote.markdown_content,
          summary_status: realtimeNote.summary_status
        }
      },
      enhancementTimestamps: {
        summary: currentNote.summary_generated_at,
        keyPoints: currentNote.key_points_generated_at,
        improvedClarity: currentNote.improved_content_generated_at,
        markdown: currentNote.markdown_content_generated_at
      },
      rawContentSample: {
        improved_content: currentNote.improved_content?.substring(0, 100) || 'none',
        summary: currentNote.summary?.substring(0, 100) || 'none',
        key_points: currentNote.key_points?.substring(0, 100) || 'none'
      }
    });
  }, [note, currentNote, realtimeNote, refreshKey]);

  const handleRetryEnhancement = async (enhancementType: string): Promise<void> => {
    console.log("🔄 Retrying enhancement:", enhancementType);
    // Implementation for retrying enhancement
  };

  // Enhanced update handler with force refresh and real-time sync
  const handleNoteUpdate = async (updatedData: Partial<Note>) => {
    try {
      console.log("🎯 NoteStudyView - Handling note update with force refresh:", {
        noteId: currentNote.id,
        updatedFields: Object.keys(updatedData),
        enhancementData: {
          improved_content: updatedData.improved_content?.substring(0, 50) || 'none',
          summary: updatedData.summary?.substring(0, 50) || 'none',
          key_points: updatedData.key_points?.substring(0, 50) || 'none'
        }
      });
      
      await updateNote(currentNote.id, updatedData);
      
      // Force immediate refresh of the component
      forceRefresh();
      
      // Also update local realtime state immediately
      setRealtimeNote(prev => ({ ...prev, ...updatedData }));
      
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
