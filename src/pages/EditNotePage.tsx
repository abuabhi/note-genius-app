
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { LoadingState } from "@/components/notes/page/LoadingState";
import { ErrorState } from "@/components/notes/page/ErrorState";
import { EditNoteContent } from "@/components/notes/page/EditNoteContent";

const EditNotePage = () => {
  const { noteId } = useParams();
  const { notes } = useNotes();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Note | null>(null);
  
  // Ensure user is authenticated
  useRequireAuth();

  useEffect(() => {
    if (notes.length > 0 && noteId) {
      const foundNote = notes.find(n => n.id === noteId);
      setNote(foundNote || null);
      setLoading(false);
    }
  }, [notes, noteId]);

  if (loading) {
    return (
      <Layout>
        <LoadingState message="Loading note..." />
      </Layout>
    );
  }

  if (!note) {
    return (
      <Layout>
        <ErrorState />
      </Layout>
    );
  }

  return (
    <Layout>
      <EditNoteContent note={note} />
    </Layout>
  );
};

export default EditNotePage;
