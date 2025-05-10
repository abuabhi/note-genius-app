
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";

export const useNoteStudyEditor = (note: Note) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(note.title || '');
  const [editableContent, setEditableContent] = useState(note.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string; color: string }[]>(
    note.tags || []
  );
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

  // Toggle editing state
  const toggleEditing = () => {
    if (isEditing) {
      // Cancel editing, restore original content
      setEditableContent(note.content || '');
      setEditableTitle(note.title || '');
      setSelectedTags(note.tags || []);
    } else {
      // Start editing
      setEditableContent(note.content || '');
      setEditableTitle(note.title || '');
      setSelectedTags(note.tags || []);
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
  
  // Save content changes
  const handleSaveContent = async () => {
    // Check if anything changed
    if (editableContent === note.content && 
        editableTitle === note.title &&
        JSON.stringify(selectedTags) === JSON.stringify(note.tags)) {
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
      toast("Note updated successfully");
      // We need to update the note in our view
      note.content = editableContent;
      note.title = editableTitle;
      note.tags = selectedTags;
      setIsEditing(false);
    } catch (error) {
      toast("Failed to save changes", {
        description: "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle content enhancement
  const handleEnhanceContent = (enhancedContent: string) => {
    if (isEditing) {
      setEditableContent(enhancedContent);
    } else {
      // Save directly
      updateNoteInDatabase(note.id, { content: enhancedContent })
        .then(() => {
          note.content = enhancedContent;
          toast("Content enhanced successfully");
        })
        .catch(() => {
          toast("Failed to save enhanced content");
        });
    }
  };

  return {
    isEditing,
    editableTitle,
    editableContent,
    selectedTags,
    availableTags,
    isSaving,
    toggleEditing,
    handleTitleChange,
    handleContentChange,
    handleSaveContent,
    handleEnhanceContent,
    setSelectedTags
  };
};
