
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { useNotes } from '@/contexts/NoteContext';
import { toast } from 'sonner';

export const useNoteStudyEditor = (note: Note, forceRefresh: () => void) => {
  const { updateNote, tags } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(note.content || note.description || '');
  const [editableTitle, setEditableTitle] = useState(note.title);
  const [selectedTags, setSelectedTags] = useState(note.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  // Update editable content when note changes
  useEffect(() => {
    setEditableContent(note.content || note.description || '');
    setEditableTitle(note.title);
    setSelectedTags(note.tags || []);
  }, [note.id, note.content, note.description, note.title, note.tags]);

  const handleContentChange = useCallback((content: string) => {
    setEditableContent(content);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setEditableTitle(title);
  }, []);

  const handleSaveContent = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateNote(note.id, {
        title: editableTitle,
        content: editableContent,
        description: editableContent, // Keep description in sync
        tags: selectedTags
      });
      
      setIsEditing(false);
      forceRefresh();
      toast.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [note.id, editableTitle, editableContent, selectedTags, updateNote, forceRefresh]);

  const toggleEditing = useCallback(() => {
    if (isEditing) {
      // Reset to original content if canceling
      setEditableContent(note.content || note.description || '');
      setEditableTitle(note.title);
      setSelectedTags(note.tags || []);
    }
    setIsEditing(!isEditing);
  }, [isEditing, note.content, note.description, note.title, note.tags]);

  const onNoteUpdate = useCallback(async (updatedData: Partial<Note>) => {
    try {
      await updateNote(note.id, updatedData);
      forceRefresh();
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  }, [note.id, updateNote, forceRefresh]);

  return {
    isEditing,
    editableContent,
    editableTitle,
    selectedTags,
    availableTags: tags,
    isSaving,
    handleContentChange,
    handleTitleChange,
    handleSaveContent,
    toggleEditing,
    setSelectedTags,
    onNoteUpdate
  };
};
