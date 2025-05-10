
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useNotes } from "@/contexts/NoteContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CreateNoteForm } from "@/components/notes/page/CreateNoteForm";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "sonner";

const EditNotePage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { notes, updateNote } = useNotes();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Note | null>(null);
  useRequireAuth();

  useEffect(() => {
    if (notes.length > 0 && noteId) {
      const foundNote = notes.find(n => n.id === noteId);
      setNote(foundNote || null);
      setLoading(false);
    }
  }, [notes, noteId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSaveNote = async (updatedNoteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      if (!noteId) return null;
      
      await updateNote(noteId, updatedNoteData);
      toast("Note updated successfully");
      
      // Navigate back to the previous page
      navigate(-1);
      
      // Return the updated note (not actually used here but required by the interface)
      return { ...updatedNoteData, id: noteId };
    } catch (error) {
      toast("Failed to update note", {
        description: "There was an error updating your note",
      });
      return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
            <p className="mt-2 text-muted-foreground">Loading note...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Note Not Found</h2>
            <p className="mb-4 text-red-600">
              The note you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={handleGoBack}>
              Back to Notes
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleGoBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-purple-800">Edit Note</h1>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-purple-100 p-6">
          <CreateNoteForm onSave={handleSaveNote} initialData={note} />
        </div>
      </div>
    </Layout>
  );
};

export default EditNotePage;
