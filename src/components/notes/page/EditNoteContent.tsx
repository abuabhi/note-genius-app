
import { Note } from "@/types/note";
import { CreateNoteForm } from "@/components/notes/page/CreateNoteForm";
import { BackButton } from "@/components/notes/page/BackButton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useNotes } from "@/contexts/NoteContext";

interface EditNoteContentProps {
  note: Note;
}

export const EditNoteContent = ({ note }: EditNoteContentProps) => {
  const navigate = useNavigate();
  const { updateNote } = useNotes();

  const handleSaveNote = async (updatedNoteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      await updateNote(note.id, updatedNoteData);
      toast("Note updated successfully");
      
      // Navigate back to the previous page
      navigate(-1);
      
      // Return the updated note (not actually used here but required by the interface)
      return { ...updatedNoteData, id: note.id };
    } catch (error) {
      toast("Failed to update note", {
        description: "There was an error updating your note"
      });
      return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton title="Edit Note" />
      
      <div className="bg-white shadow-sm rounded-lg border border-mint-100 p-6">
        <CreateNoteForm onSave={handleSaveNote} initialData={note} />
      </div>
    </div>
  );
};
