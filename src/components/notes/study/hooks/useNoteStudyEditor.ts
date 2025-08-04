import { useState, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { toast } from 'sonner';

export const useNoteStudyEditor = (note: Note, forceRefresh: () => void) => {
  const { updateNote } = useOptimizedNotes();
  const { subjects: userSubjects } = useUserSubjects();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(note.content || '');
  const [editableTitle, setEditableTitle] = useState(note.title || '');
  const [editableSubject, setEditableSubject] = useState(note.subject || '');
  const [selectedTags, setSelectedTags] = useState(note.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  // Mock data for tags (keeping this as is for now)
  const availableTags = [
    { id: '1', name: 'Important', color: '#ef4444' },
    { id: '2', name: 'Study', color: '#3b82f6' },
    { id: '3', name: 'Review', color: '#10b981' }
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
      // Find the subject_id for the selected subject name
      const selectedSubjectObj = userSubjects.find(s => s.name === editableSubject);
      
      await updateNote(note.id, {
        title: editableTitle,
        content: editableContent,
        subject: editableSubject,
        subject_id: selectedSubjectObj?.id || null,
        tags: selectedTags
      });
      
      toast.success('Note saved successfully!');
      setIsEditing(false);
      
      // Update the local note object immediately to reflect changes
      note.title = editableTitle;
      note.content = editableContent;
      note.subject = editableSubject;
      note.tags = selectedTags;
      
      forceRefresh();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [note.id, editableTitle, editableContent, editableSubject, selectedTags, updateNote, forceRefresh, userSubjects]);

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
    availableSubjects: userSubjects,
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
