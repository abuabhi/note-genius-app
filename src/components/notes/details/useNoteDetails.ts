
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '@/contexts/NoteContext';
import { Note } from '@/types/note';
import { useToast } from '@/hooks/use-toast';

export const useNoteDetails = (note: Note, onOpenChange: (open: boolean) => void) => {
  const { toast } = useToast();
  const { updateNote, pinNote, archiveNote, deleteNote } = useNotes();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const [noteContent, setNoteContent] = useState(note.content || '');
  
  // Get scan data preview URL if available
  const scanPreviewUrl = note.sourceType === 'scan' && note.scanData?.originalImageUrl
    ? note.scanData.originalImageUrl
    : null;

  // Get import data preview URL if available
  const importPreviewUrl = note.sourceType === 'import' && note.importData?.previewUrl
    ? note.importData.previewUrl
    : null;

  // Handle pinning/unpinning note
  const handlePin = async () => {
    try {
      await pinNote(note.id, !note.pinned);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pin note",
        variant: "destructive"
      });
    }
  };

  // Handle archiving/unarchiving note
  const handleArchive = async () => {
    try {
      await archiveNote(note.id, !note.archived);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive note",
        variant: "destructive"
      });
    }
  };

  // Handle deleting note
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNote(note.id);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle opening study mode
  const handleOpenStudyMode = () => {
    onOpenChange(false);
    navigate(`/notes/study/${note.id}`);
  };

  // Handle applying AI enhancements
  const handleApplyEnhancement = async (enhancedContent: string) => {
    setNoteContent(enhancedContent);
    
    // Also update in database
    try {
      await updateNote(note.id, { content: enhancedContent });
      toast({
        title: "Content updated",
        description: "Enhanced content has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save enhanced content",
        variant: "destructive"
      });
    }
  };

  return {
    isDeleting,
    noteContent,
    setNoteContent,
    handlePin,
    handleArchive,
    handleDelete,
    handleOpenStudyMode,
    handleApplyEnhancement,
    scanPreviewUrl,
    importPreviewUrl
  };
};
