
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNotes } from "@/contexts/NoteContext";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { useRequireAuth, TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { NotesHeader } from "./NotesHeader";
import { AdminNoteDelete } from "../AdminNoteDelete";
import { TierInfo } from "./TierInfo";
import { SubjectsSection } from "./SubjectsSection";
import { NotesDisplay } from "./NotesDisplay";
import { NoteCreationDialogs } from "./NoteCreationDialogs";

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
  const isAuthorized = !!user;
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
          <p className="mt-2 text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the useRequireAuth hook will redirect
  if (!isAuthorized) {
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
      
      {/* Admin Delete Tool - Only show for authenticated users */}
      {isAuthorized && (
        <div className="mb-6">
          <AdminNoteDelete />
        </div>
      )}
      
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
