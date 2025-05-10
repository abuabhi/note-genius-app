
import Layout from "@/components/layout/Layout";
import { NotesContent } from "@/components/notes/page/NotesContent";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "@/components/ui/sonner";

const NotesPage = () => {
  const { addNote } = useNotes();
  const { userProfile, tierLimits } = useRequireAuth();
  const userTier = userProfile?.user_tier;

  const handleSaveNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const newNote = await addNote(note);
      toast("Note created successfully");
      return newNote;
    } catch (error) {
      toast("Failed to create note", {
        description: "There was an error creating your note",
      });
      return null;
    }
  };

  const handleScanNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const newNote = await addNote({
        ...note,
        sourceType: 'scan'
      });
      toast("Scanned note created successfully");
      return newNote;
    } catch (error) {
      toast("Failed to create scanned note", {
        description: "There was an error processing your scan",
      });
      return null;
    }
  };

  const handleImportNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const newNote = await addNote({
        ...note,
        sourceType: 'import'
      });
      toast("Note imported successfully");
      return newNote;
    } catch (error) {
      toast("Failed to import note", {
        description: "There was an error importing your document",
      });
      return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
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
