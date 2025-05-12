
import { useState } from "react";
import { Note } from "@/types/note";

/**
 * Hook to manage the editor state for a note
 */
export const useEditorState = (note: Note) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(note.title || '');
  const [editableContent, setEditableContent] = useState(note.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string; color: string }[]>(
    // Create a deep copy of the tags to prevent reference issues
    (note.tags || []).map(tag => ({...tag}))
  );

  // Toggle editing state
  const toggleEditing = () => {
    if (isEditing) {
      // Cancel editing, restore original content
      setEditableContent(note.content || '');
      setEditableTitle(note.title || '');
      // Create a deep copy of the original tags
      setSelectedTags((note.tags || []).map(tag => ({...tag})));
    } else {
      // Start editing
      setEditableContent(note.content || '');
      setEditableTitle(note.title || '');
      // Create a deep copy of the original tags
      setSelectedTags((note.tags || []).map(tag => ({...tag})));
    }
    setIsEditing(!isEditing);
  };
  
  // Handle content changes
  const handleContentChange = (html: string) => {
    setEditableContent(html);
  };
  
  // Handle title changes
  const handleTitleChange = (title: string) => {
    setEditableTitle(title);
  };

  return {
    isEditing,
    editableTitle,
    editableContent,
    isSaving,
    selectedTags,
    setIsEditing,
    setEditableContent,
    setEditableTitle,
    setIsSaving,
    setSelectedTags,
    toggleEditing,
    handleContentChange,
    handleTitleChange
  };
};
