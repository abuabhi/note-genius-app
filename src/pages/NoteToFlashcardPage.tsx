
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import Layout from "@/components/layout/Layout";
import { NoteToFlashcard } from "@/components/notes/conversion/NoteToFlashcard";
import { Note } from "@/types/note";

const NoteToFlashcardPage = () => {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('noteId');
  const flashcardSetId = searchParams.get('flashcardSetId');
  const { notes } = useOptimizedNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    if (noteId && notes.length > 0) {
      const note = notes.find(n => n.id === noteId);
      setSelectedNote(note || null);
    }
  }, [noteId, notes]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <NoteToFlashcard 
          note={selectedNote} 
          flashcardSetId={flashcardSetId}
        />
      </div>
    </Layout>
  );
};

export default NoteToFlashcardPage;
