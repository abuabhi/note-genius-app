
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { useNavigate } from 'react-router-dom';
import { useSimpleNotes } from '@/hooks/useSimpleNotes';
import { toast } from 'sonner';

export const useNoteDetails = (note: Note, onClose: (open: boolean) => void) => {
  const navigate = useNavigate();
  const { updateNote, deleteNote } = useSimpleNotes();
  const [noteContent, setNoteContent] = useState(note.content || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePin = useCallback(async () => {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
      toast.success(note.pinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      console.error('Error pinning note:', error);
      toast.error('Failed to update note pin status');
    }
  }, [note, updateNote]);

  const handleArchive = useCallback(async () => {
    try {
      await updateNote(note.id, { archived: !note.archived });
      toast.success(note.archived ? "Note unarchived" : "Note archived");
    } catch (error) {
      console.error('Error archiving note:', error);
      toast.error('Failed to update note archive status');
    }
  }, [note, updateNote]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      toast.success("Note deleted successfully");
      onClose(false);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  }, [note, deleteNote, onClose]);

  const handleApplyEnhancement = useCallback(async () => {
    try {
      // Placeholder for AI enhancement logic
      const enhancedContent = `AI Enhanced: ${noteContent}`;
      setNoteContent(enhancedContent);
      await updateNote(note.id, { content: enhancedContent });
      toast.success("Note content enhanced with AI");
    } catch (error) {
      console.error('Error applying enhancement:', error);
      toast.error('Failed to apply enhancement');
    }
  }, [note, noteContent, updateNote]);

  const handleOpenStudyMode = useCallback(() => {
    navigate(`/notes/study/${note.id}`);
  }, [note, navigate]);

  // Determine preview URLs based on source type
  const scanPreviewUrl = note.sourceType === 'scan' && note.scanData?.originalImageUrl ? note.scanData.originalImageUrl : null;
  const importPreviewUrl = note.sourceType === 'import' && note.importData?.originalFileUrl ? note.importData.originalFileUrl : null;

  return {
    noteContent,
    setNoteContent,
    isDeleting,
    handlePin,
    handleArchive,
    handleDelete,
    handleApplyEnhancement,
    handleOpenStudyMode,
    scanPreviewUrl,
    importPreviewUrl
  };
};
