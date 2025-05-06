
import Layout from "@/components/layout/Layout";
import { NoteProvider } from "@/contexts/NoteContext";
import { NotesContent } from "@/components/notes/page/NotesContent";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const NotesPageContent = () => {
  const { addNote } = useNotes();
  const { tierLimits, profile } = useRequireAuth();
  const userTier = profile?.user_tier;

  const handleSaveNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    return await addNote(note);
  };

  const handleScanNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    return await addNote({
      ...note,
      sourceType: 'scan'
    });
  };

  const handleImportNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    return await addNote({
      ...note,
      sourceType: 'import'
    });
  };

  return (
    <NotesContent 
      onSaveNote={handleSaveNote}
      onScanNote={handleScanNote}
      onImportNote={handleImportNote}
      tierLimits={tierLimits}
      userTier={userTier}
    />
  );
};

const NotesPage = () => {
  return (
    <Layout>
      <NoteProvider>
        <NotesPageContent />
      </NoteProvider>
    </Layout>
  );
};

export default NotesPage;
