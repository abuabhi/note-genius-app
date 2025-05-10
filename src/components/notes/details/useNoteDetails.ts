
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { useNotes } from '@/contexts/NoteContext';

export const useNoteDetails = (note: Note, onOpenChange: (open: boolean) => void) => {
  const navigate = useNavigate();
  const { updateNote, pinNote, archiveNote, deleteNote } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteContent, setNoteContent] = useState(note.content || '');

  // This function will be called when the content is changed in the content section
  const handleContentChange = async (content: string) => {
    setNoteContent(content);
    try {
      await updateNote(note.id, { content });
    } catch (error) {
      console.error('Error updating note content:', error);
      toast('Failed to update content', {
        description: 'An error occurred while updating the note content',
      });
    }
  };

  const handlePin = async () => {
    try {
      await pinNote(note.id, !note.pinned);
      toast(`Note ${note.pinned ? 'unpinned' : 'pinned'} successfully`, {
        description: note.pinned ? 'The note is no longer pinned' : 'The note is now pinned at the top',
      });
    } catch (error) {
      toast('Failed to pin note', {
        description: 'An error occurred while updating the note',
      });
    }
  };

  const handleArchive = async () => {
    try {
      await archiveNote(note.id, !note.archived);
      toast(`Note ${note.archived ? 'restored' : 'archived'} successfully`, {
        description: note.archived ? 'The note is no longer archived' : 'The note has been moved to archive',
      });
      onOpenChange(false);
    } catch (error) {
      toast('Failed to archive note', {
        description: 'An error occurred while updating the note',
      });
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      await deleteNote(note.id);
      toast('Note deleted successfully', {
        description: 'The note has been permanently deleted',
      });
      onOpenChange(false);
    } catch (error) {
      toast('Failed to delete note', {
        description: 'An error occurred while deleting the note',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyContent = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content);
      toast('Copied to clipboard', {
        description: 'Note content copied to clipboard',
      });
    }
  };

  const handleApplyEnhancement = (enhancedContent: string) => {
    setNoteContent(enhancedContent);
    updateNote(note.id, { content: enhancedContent });
  };

  const handleOpenStudyMode = () => {
    onOpenChange(false); // Close the dialog
    navigate(`/notes/study/${note.id}`); // Navigate to the study mode page
  };

  const getScanPreviewUrl = () => {
    if (note.sourceType === 'scan' && note.scanData?.originalImageUrl) {
      return note.scanData.originalImageUrl;
    }
    return null;
  };

  const getImportPreviewUrl = () => {
    if (note.sourceType === 'import' && note.importData?.originalFileUrl) {
      return note.importData.originalFileUrl;
    }
    return null;
  };

  return {
    isDeleting,
    noteContent,
    setNoteContent: handleContentChange,
    handlePin,
    handleArchive,
    handleDelete,
    handleCopyContent,
    handleApplyEnhancement,
    handleOpenStudyMode,
    scanPreviewUrl: getScanPreviewUrl(),
    importPreviewUrl: getImportPreviewUrl(),
  };
};
