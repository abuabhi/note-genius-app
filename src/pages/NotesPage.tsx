import Layout from "@/components/layout/Layout";
import { NotesContent } from "@/components/notes/page/NotesContent";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterOptions } from "@/contexts/notes/types";

const NotesPage = () => {
  const { addNote, availableCategories, setFilterOptions } = useNotes();
  const { userProfile, tierLimits } = useRequireAuth();
  const userTier = userProfile?.user_tier;
  const navigate = useNavigate();
  const location = useLocation();

  // Fixed the redirection issue - simplified the effect logic
  useEffect(() => {
    // Just set the current location in localStorage without redirection logic
    localStorage.setItem("lastVisitedPage", location.pathname);
    
    // Clear any existing filter options to start fresh
    const resetOptions: FilterOptions = {
      dateFrom: undefined,
      dateTo: undefined
    };
    
    setFilterOptions(resetOptions);
  }, [location.pathname, setFilterOptions]);

  const handleSaveNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // Ensure category is added as a tag if it doesn't already exist
      if (note.category && note.category !== 'General' && note.category !== 'Uncategorized') {
        const color = generateColorFromString(note.category);
        
        // Check if we already have this category as a tag
        const existingCategoryTag = note.tags?.find(tag => tag.name === note.category);
        
        if (!existingCategoryTag) {
          // Add category as a tag
          note.tags = [...(note.tags || []), { 
            name: note.category, 
            color 
          }];
        }
      }
      
      const newNote = await addNote(note);
      toast("Note created successfully");
      return newNote;
    } catch (error) {
      console.error("Error creating note:", error);
      toast("Failed to create note", {
        description: "There was an error creating your note",
      });
      return null;
    }
  };

  const handleScanNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // Ensure category is added as a tag
      if (note.category && note.category !== 'General' && note.category !== 'Uncategorized') {
        const color = generateColorFromString(note.category);
        
        // Check if we already have this category as a tag
        const existingCategoryTag = note.tags?.find(tag => tag.name === note.category);
        
        if (!existingCategoryTag) {
          // Add category as a tag
          note.tags = [...(note.tags || []), { 
            name: note.category, 
            color 
          }];
        }
      }
      
      const newNote = await addNote({
        ...note,
        sourceType: 'scan'
      });
      toast("Scanned note created successfully");
      return newNote;
    } catch (error) {
      console.error("Error creating scanned note:", error);
      toast("Failed to create scanned note", {
        description: "There was an error processing your scan",
      });
      return null;
    }
  };

  const handleImportNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // Ensure category is added as a tag
      if (note.category && note.category !== 'General' && note.category !== 'Uncategorized') {
        const color = generateColorFromString(note.category);
        
        // Check if we already have this category as a tag
        const existingCategoryTag = note.tags?.find(tag => tag.name === note.category);
        
        if (!existingCategoryTag) {
          // Add category as a tag
          note.tags = [...(note.tags || []), { 
            name: note.category, 
            color 
          }];
        }
      }
      
      const newNote = await addNote({
        ...note,
        sourceType: 'import'
      });
      toast("Note imported successfully");
      return newNote;
    } catch (error) {
      console.error("Error importing note:", error);
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
