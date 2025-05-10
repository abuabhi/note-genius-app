
import Layout from "@/components/layout/Layout";
import { NotesContent } from "@/components/notes/page/NotesContent";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const NotesPage = () => {
  const { addNote } = useNotes();
  const { userProfile, tierLimits } = useRequireAuth();
  const userTier = userProfile?.user_tier;

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
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <NotesContent 
          onSaveNote={handleSaveNote}
          onScanNote={handleScanNote}
          onImportNote={handleImportNote}
          tierLimits={tierLimits}
          userTier={userTier}
        />
      </div>
    </Layout>
  );
};

export default NotesPage;
