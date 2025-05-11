
import Layout from "@/components/layout/Layout";
import { NotesContent } from "@/components/notes/page/NotesContent";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FilterOptions } from "@/contexts/notes/types";
import { useUserSubjects } from "@/hooks/useUserSubjects";

const NotesPage = () => {
  const { addNote, availableCategories, setFilterOptions, addCategory } = useNotes();
  const { userProfile, tierLimits } = useRequireAuth();
  const userTier = userProfile?.user_tier;
  const location = useLocation();
  const { subjects } = useUserSubjects();

  useEffect(() => {
    // Reset filters when component mounts
    const resetOptions: FilterOptions = {
      dateFrom: undefined,
      dateTo: undefined
    };
    
    setFilterOptions(resetOptions);
    
    // Simply record that we're on the notes page - no redirection logic at all
    localStorage.setItem("lastVisitedPage", location.pathname);

    // Debug subject information
    console.log("Available subjects:", subjects);
  }, [setFilterOptions, location.pathname, subjects]);

  // Helper function to find subject_id based on category name
  const findSubjectIdByName = (categoryName: string): string | undefined => {
    // Case insensitive matching to improve chances of finding matches
    const matchingSubject = subjects.find(subject => 
      subject.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (matchingSubject) {
      console.log(`Matched category ${categoryName} to subject ID ${matchingSubject.id}`);
    } else {
      console.log(`No subject match found for category: ${categoryName}`);
    }
    
    return matchingSubject?.id;
  };

  const handleSaveNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // If a category is provided and it's not already in our list, add it
      if (note.category && note.category !== 'General' && note.category !== 'Uncategorized') {
        addCategory(note.category);
      }
      
      // Try to find matching subject_id for the category
      const subject_id = findSubjectIdByName(note.category);
      
      const newNote = await addNote({
        ...note,
        subject_id
      });
      
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
      // If a category is provided and it's not already in our list, add it
      if (note.category && note.category !== 'General' && note.category !== 'Uncategorized') {
        addCategory(note.category);
      }
      
      // Try to find matching subject_id for the category
      const subject_id = findSubjectIdByName(note.category);
      
      const newNote = await addNote({
        ...note,
        sourceType: 'scan',
        subject_id
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
      // If a category is provided and it's not already in our list, add it
      if (note.category && note.category !== 'General' && note.category !== 'Uncategorized') {
        addCategory(note.category);
      }
      
      // Try to find matching subject_id for the category
      const subject_id = findSubjectIdByName(note.category);
      
      const newNote = await addNote({
        ...note,
        sourceType: 'import',
        subject_id
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
