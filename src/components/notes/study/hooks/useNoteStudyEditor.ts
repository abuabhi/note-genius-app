
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";

export const useNoteStudyEditor = (note: Note) => {
  const [isEditing, setIsEditing] = useState(false);
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
      setSelectedTags(note.tags || []);
    } else {
      // Start editing
      setEditableContent(note.content || '');
      setSelectedTags(note.tags || []);
    }
    setIsEditing(!isEditing);
  };
  
  // Handle content changes
  const handleContentChange = (html: string) => {
    setEditableContent(html);
  };
  
  // Save content changes
  const handleSaveContent = async () => {
    if (editableContent === note.content && 
        JSON.stringify(selectedTags) === JSON.stringify(note.tags)) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateNoteInDatabase(note.id, {
        content: editableContent,
        tags: selectedTags
      });
      toast("Content updated successfully");
      // We need to update the note in our view
      note.content = editableContent;
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
    editableContent,
    selectedTags,
    availableTags,
    isSaving,
    toggleEditing,
    handleContentChange,
    handleSaveContent,
    handleEnhanceContent,
    setSelectedTags
  };
};
