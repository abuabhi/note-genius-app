
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
      // Check if a tag for the note's category already exists
      const categoryTag = note.tags?.find(tag => tag.name === note.category);
      
      // If no tag exists for this category and it's not a default category, create one
      if (!categoryTag && note.category !== 'General' && note.category !== 'Uncategorized') {
        // Generate a consistent color from the category name
        const color = generateColorFromString(note.category);
        
        // Add the category as a tag if it doesn't already exist
        note.tags = [...(note.tags || []), { 
          name: note.category, 
          color 
        }];
      }
      
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
      // Ensure category is added as a tag
      if (note.category !== 'General' && note.category !== 'Uncategorized') {
        const color = generateColorFromString(note.category);
        note.tags = [...(note.tags || []), { name: note.category, color }];
      }
      
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
      // Ensure category is added as a tag
      if (note.category !== 'General' && note.category !== 'Uncategorized') {
        const color = generateColorFromString(note.category);
        note.tags = [...(note.tags || []), { name: note.category, color }];
      }
      
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

  // Generate a color based on a string (for category tags)
  const generateColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
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
