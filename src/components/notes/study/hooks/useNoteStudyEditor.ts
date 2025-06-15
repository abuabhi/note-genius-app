
import { useState, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { toast } from 'sonner';

export const useNoteStudyEditor = (note: Note, forceRefresh: () => void) => {
  const { updateNote } = useOptimizedNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(note.content || '');
  const [editableTitle, setEditableTitle] = useState(note.title || '');
  const [editableSubject, setEditableSubject] = useState(note.subject || '');
  const [selectedTags, setSelectedTags] = useState(note.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  // Mock data for tags and subjects
  const availableTags = [
    { id: '1', name: 'Important', color: '#ef4444' },
    { id: '2', name: 'Study', color: '#3b82f6' },
    { id: '3', name: 'Review', color: '#10b981' }
  ];

  const availableSubjects = [
    'Mathematics',
    'Science',
    'History',
    'Literature',
    'Physics',
    'Chemistry'
  ];

  // Update local state when note changes
  useEffect(() => {
    setEditableContent(note.content || '');
    setEditableTitle(note.title || '');
    setEditableSubject(note.subject || '');
    setSelectedTags(note.tags || []);
  }, [note]);

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
        subject: editableSubject,
        tags: selectedTags
      });
      
      toast.success('Note saved successfully!');
      setIsEditing(false);
      forceRefresh();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [note.id, editableTitle, editableContent, editableSubject, selectedTags, updateNote, forceRefresh]);

  const toggleEditing = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const onNoteUpdate = useCallback(async (updates: Partial<Note>) => {
    try {
      await updateNote(note.id, updates);
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
    availableTags,
    availableSubjects,
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
