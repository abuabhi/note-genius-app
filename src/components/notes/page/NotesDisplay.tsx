
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { Note } from "@/types/note";
import { LoadingState } from "./LoadingState";
import { EmptyNotesState } from "@/components/notes/EmptyNotesState";
import { EmptySubjectState } from "./EmptySubjectState";
import { WelcomeOnboarding } from "./WelcomeOnboarding";
import { useState, useEffect } from "react";

interface NotesDisplayProps {
  notes: Note[];
  paginatedNotes: Note[];
  loading: boolean;
  isFiltered?: boolean;
  activeSubject?: string;
  onCreateNote?: () => void;
  onScanNote?: () => void;
  onImportNote?: () => void;
}

export const NotesDisplay = ({ 
  notes, 
  paginatedNotes, 
  loading,
  isFiltered = false,
  activeSubject,
  onCreateNote,
  onScanNote,
  onImportNote
}: NotesDisplayProps) => {
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome onboarding for first-time users
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('notes-welcome-seen');
    if (!hasSeenWelcome && notes.length === 0 && !loading) {
      setShowWelcome(true);
    }
  }, [notes.length, loading]);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('notes-welcome-seen', 'true');
  };

  if (loading) {
    return <LoadingState message="Loading your notes..." />;
  }
  
  // Show welcome onboarding for new users
  if (showWelcome && notes.length === 0) {
    return (
      <>
        <WelcomeOnboarding 
          onCreateNote={onCreateNote}
          onScanNote={onScanNote}
          onImportNote={onImportNote}
          onDismiss={handleDismissWelcome}
        />
        <EmptyNotesState 
          onCreateNote={onCreateNote}
          onScanNote={onScanNote}
          onImportNote={onImportNote}
          isFiltered={isFiltered}
        />
      </>
    );
  }
  
  // Show empty state based on context
  if (notes.length === 0) {
    if (activeSubject && activeSubject !== 'all') {
      return (
        <EmptySubjectState 
          subjectName={activeSubject}
          onCreateNote={onCreateNote}
        />
      );
    }
    
    return (
      <EmptyNotesState 
        onCreateNote={onCreateNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
        isFiltered={isFiltered}
      />
    );
  }

  return (
    <>
      <NotesGrid notes={paginatedNotes} />
      {notes.length > 0 && <NotePagination />}
    </>
  );
};
