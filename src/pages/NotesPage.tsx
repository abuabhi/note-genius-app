
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
  }, [setFilterOptions, location.pathname]);

  // Helper function to find subject_id based on category name
  const findSubjectIdByName = (categoryName: string): string | undefined => {
    if (!categoryName) return undefined;
    
    // Case insensitive matching to improve chances of finding matches
    const matchingSubject = subjects.find(subject => 
      subject.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    return matchingSubject?.id;
  };

  // Check if a category already exists as a subject
  const isCategoryExistingSubject = (categoryName: string): boolean => {
    if (!categoryName || categoryName === 'General' || categoryName === 'Uncategorized') return false;
    
    return subjects.some(subject => 
      subject.name.toLowerCase() === categoryName.toLowerCase()
    );
  };

  const handleSaveNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // If a category is provided and it matches an existing subject, use that subject's ID
      // but don't create a new category
      let subject_id = note.subject_id || findSubjectIdByName(note.category);
      let category = note.category;
      
      // If category matches a subject name, set it accordingly
      if (note.category && isCategoryExistingSubject(note.category)) {
        // Clear the category since we're using the subject_id instead
        category = ''; 
      }
      
      // Only add the category if it's not already an existing subject
      if (note.category && 
          note.category !== 'General' && 
          note.category !== 'Uncategorized' && 
          !isCategoryExistingSubject(note.category)) {
        addCategory(note.category);
      }
      
      const newNote = await addNote({
        ...note,
        category,
        subject_id
      });
      
      if (newNote) {
        toast.success("Note created successfully");
        return newNote;
      } else {
        toast.error("Failed to create note");
        return null;
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note", {
        description: "There was an error creating your note",
      });
      return null;
    }
  };

  const handleScanNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // If a category is provided and it matches an existing subject, use that subject's ID
      let subject_id = note.subject_id || findSubjectIdByName(note.category);
      let category = note.category;
      
      // If category matches a subject name, set it accordingly
      if (note.category && isCategoryExistingSubject(note.category)) {
        // Clear the category since we're using the subject_id instead
        category = ''; 
      }
      
      // Only add the category if it's not already an existing subject
      if (note.category && 
          note.category !== 'General' && 
          note.category !== 'Uncategorized' && 
          !isCategoryExistingSubject(note.category)) {
        addCategory(note.category);
      }
      
      const newNote = await addNote({
        ...note,
        category,
        subject_id,
        sourceType: 'scan'
      });
      
      if (newNote) {
        toast.success("Scanned note created successfully");
        return newNote;
      } else {
        toast.error("Failed to create scanned note");
        return null;
      }
    } catch (error) {
      console.error("Error creating scanned note:", error);
      toast.error("Failed to create scanned note", {
        description: "There was an error processing your scan",
      });
      return null;
    }
  };

  const handleImportNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // If a category is provided and it matches an existing subject, use that subject's ID
      let subject_id = note.subject_id || findSubjectIdByName(note.category);
      let category = note.category;
      
      // If category matches a subject name, set it accordingly
      if (note.category && isCategoryExistingSubject(note.category)) {
        // Clear the category since we're using the subject_id instead
        category = ''; 
      }
      
      // Only add the category if it's not already an existing subject
      if (note.category && 
          note.category !== 'General' && 
          note.category !== 'Uncategorized' && 
          !isCategoryExistingSubject(note.category)) {
        addCategory(note.category);
      }
      
      const newNote = await addNote({
        ...note,
        category,
        subject_id,
        sourceType: 'import'
      });
      
      if (newNote) {
        toast.success("Note imported successfully");
        return newNote;
      } else {
        toast.error("Failed to import note");
        return null;
      }
    } catch (error) {
      console.error("Error importing note:", error);
      toast.error("Failed to import note", {
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
