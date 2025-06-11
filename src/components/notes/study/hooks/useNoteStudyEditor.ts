
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { useNotes } from '@/contexts/NoteContext';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { toast } from 'sonner';

export const useNoteStudyEditor = (note: Note, forceRefresh: () => void) => {
  const { updateNote, tags } = useNotes();
  const { subjects } = useUserSubjects();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(note.content || note.description || '');
  const [editableTitle, setEditableTitle] = useState(note.title);
  const [editableSubject, setEditableSubject] = useState(note.category || 'General');
  const [selectedTags, setSelectedTags] = useState(note.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  // Update editable content when note changes
  useEffect(() => {
    setEditableContent(note.content || note.description || '');
    setEditableTitle(note.title);
    setEditableSubject(note.category || 'General');
    setSelectedTags(note.tags || []);
  }, [note.id, note.content, note.description, note.title, note.category, note.tags]);

  const handleContentChange = useCallback((content: string) => {
    setEditableContent(content);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setEditableTitle(title);
  }, []);

  const handleSubjectChange = useCallback((subject: string) => {
    setEditableSubject(subject);
  }, []);

  const handleSaveContent = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateNote(note.id, {
        title: editableTitle,
        content: editableContent,
        description: editableContent, // Keep description in sync
        category: editableSubject,
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
  }, [note.id, editableTitle, editableContent, editableSubject, selectedTags, updateNote, forceRefresh]);

  const toggleEditing = useCallback(() => {
    if (isEditing) {
      // Reset to original content if canceling
      setEditableContent(note.content || note.description || '');
      setEditableTitle(note.title);
      setEditableSubject(note.category || 'General');
      setSelectedTags(note.tags || []);
    }
    setIsEditing(!isEditing);
  }, [isEditing, note.content, note.description, note.title, note.category, note.tags]);

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
    editableSubject,
    selectedTags,
    availableTags: tags,
    availableSubjects: subjects || [],
    isSaving,
    handleContentChange,
    handleTitleChange,
    handleSubjectChange,
    handleSaveContent,
    toggleEditing,
    setSelectedTags,
    onNoteUpdate
  };
};
