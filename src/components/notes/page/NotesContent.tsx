
import { useState } from "react";
import { useNotes } from "@/contexts/NoteContext";
import { useRequireAuth, TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Note } from "@/types/note";
import { TierInfo } from "./TierInfo";
import { NotesHeader } from "./NotesHeader";
import { SubjectsSection } from "./SubjectsSection";
import { NotesDisplay } from "./NotesDisplay";
import { NoteCreationDialogs } from "./NoteCreationDialogs";
import { LoadingState } from "./LoadingState";

interface NotesContentProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  tierLimits?: TierLimits | null;
  userTier?: UserTier;
}

export const NotesContent = ({ 
  onSaveNote, 
  onScanNote, 
  onImportNote,
  tierLimits,
  userTier 
}: NotesContentProps) => {
  const { paginatedNotes, notes, loading, setFilterOptions, filteredNotes } = useNotes();
  const { user, loading: authLoading } = useRequireAuth();
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // If not authenticated, the useRequireAuth hook will redirect
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Tier Information Section */}
      {userTier && tierLimits && (
        <TierInfo 
          userTier={userTier}
          tierLimits={tierLimits}
          notesCount={notes.length}
        />
      )}
      
      {/* Notes Header Section */}
      <NotesHeader 
        onSaveNote={onSaveNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
        tierLimits={tierLimits}
        userTier={userTier}
      />
      
      {/* Subject Tabs Section */}
      <SubjectsSection 
        activeSubjectId={activeSubjectId}
        setActiveSubjectId={setActiveSubjectId}
        setFilterOptions={setFilterOptions}
        filteredNotesCount={filteredNotes.length}
      />
      
      {/* Notes Grid and Pagination */}
      <NotesDisplay 
        notes={notes} 
        paginatedNotes={paginatedNotes} 
        loading={loading} 
      />

      {/* Dialogs for Creating Notes */}
      <NoteCreationDialogs 
        onSaveNote={onSaveNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
        tierLimits={tierLimits}
      />
    </div>
  );
};
