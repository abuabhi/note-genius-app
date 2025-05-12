
import { useEffect, useState } from "react";
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useEditorState } from "./editor/useEditorState";
import { useNoteSave } from "./editor/useNoteSave";
import { useEnhancementProcessor } from "./editor/useEnhancementProcessor";

/**
 * Main hook for note study editor functionality
 */
export const useNoteStudyEditor = (note: Note) => {
  // Editor state management
  const editorState = useEditorState(note);
  
  // Save functionality
  const { handleSaveContent } = useNoteSave(note, {
    isEditing: editorState.isEditing,
    editableContent: editorState.editableContent,
    editableTitle: editorState.editableTitle,
    selectedTags: editorState.selectedTags,
    setIsEditing: editorState.setIsEditing,
    setIsSaving: editorState.setIsSaving
  });
  
  // Enhancement functionality
  const { handleEnhanceContent } = useEnhancementProcessor(note, {
    isEditing: editorState.isEditing,
    setEditableContent: editorState.setEditableContent
  });
  
  // Tag management
  const { getAllTags } = useNotes();
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  
  // Fetch available tags when component mounts
  useEffect(() => {
    const loadTags = async () => {
      const tags = await getAllTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, [getAllTags]);

  // Return all needed props and functions
  return {
    isEditing: editorState.isEditing,
    editableTitle: editorState.editableTitle,
    editableContent: editorState.editableContent,
    selectedTags: editorState.selectedTags,
    availableTags,
    isSaving: editorState.isSaving,
    toggleEditing: editorState.toggleEditing,
    handleTitleChange: editorState.handleTitleChange,
    handleContentChange: editorState.handleContentChange,
    handleSaveContent,
    handleEnhanceContent,
    setSelectedTags: editorState.setSelectedTags
  };
};
