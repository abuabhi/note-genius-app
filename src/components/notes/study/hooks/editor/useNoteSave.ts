
import { useState } from "react";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { updateNoteInDatabase } from "@/contexts/notes/operations";

/**
 * Hook to handle saving note changes
 */
export const useNoteSave = (note: Note, editorState: {
  isEditing: boolean;
  editableContent: string;
  editableTitle: string;
  selectedTags: { id?: string; name: string; color: string }[];
  setIsEditing: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
}) => {
  const { 
    isEditing, 
    editableContent, 
    editableTitle, 
    selectedTags, 
    setIsEditing,
    setIsSaving
  } = editorState;
  
  // Save content changes
  const handleSaveContent = async () => {
    // Check if anything changed
    const tagsChanged = JSON.stringify(selectedTags) !== JSON.stringify(note.tags);
    
    if (editableContent === note.content && 
        editableTitle === note.title &&
        !tagsChanged) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateNoteInDatabase(note.id, {
        content: editableContent,
        title: editableTitle,
        tags: selectedTags
      });
      toast.success("Note updated successfully");
      // We need to update the note in our view
      note.content = editableContent;
      note.title = editableTitle;
      // Create a deep copy to prevent reference issues
      note.tags = selectedTags.map(tag => ({...tag}));
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save changes", {
        description: "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSaveContent
  };
};
