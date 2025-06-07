
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { Note } from "@/types/note";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
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
  error?: string | null;
  onRetry?: () => void;
}

export const NotesDisplay = ({ 
  notes, 
  paginatedNotes, 
  loading,
  isFiltered = false,
  activeSubject,
  onCreateNote,
  onScanNote,
  onImportNote,
  error,
  onRetry
}: NotesDisplayProps) => {
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome onboarding for first-time users
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('notes-welcome-seen');
    if (!hasSeenWelcome && notes.length === 0 && !loading && !error) {
      setShowWelcome(true);
    }
  }, [notes.length, loading, error]);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('notes-welcome-seen', 'true');
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/30 rounded-xl blur-xl"></div>
        <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-red-100/50 shadow-lg">
          <ErrorState 
            message={`Failed to load notes: ${error}`}
            onRetry={onRetry}
          />
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }
  
  // Show welcome onboarding for new users
  if (showWelcome && notes.length === 0) {
    return (
      <div className="space-y-8">
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
      </div>
    );
  }
  
  // Show empty state based on context
  if (notes.length === 0) {
    if (activeSubject && activeSubject !== 'all') {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-blue-50/30 rounded-xl blur-xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
            <EmptySubjectState 
              subjectName={activeSubject}
              onCreateNote={onCreateNote}
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-blue-50/30 rounded-xl blur-xl"></div>
        <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
          <EmptyNotesState 
            onCreateNote={onCreateNote}
            onScanNote={onScanNote}
            onImportNote={onImportNote}
            isFiltered={isFiltered}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern notes grid with enhanced spacing */}
      <div className="relative">
        <NotesGrid notes={paginatedNotes} />
      </div>
      
      {/* Enhanced pagination */}
      {notes.length > 0 && (
        <div className="flex justify-center pt-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg px-6 py-3">
            <NotePagination />
          </div>
        </div>
      )}
    </div>
  );
};
