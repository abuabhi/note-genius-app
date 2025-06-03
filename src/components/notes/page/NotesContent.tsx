
import { useState } from "react";
import { useNotes } from "@/contexts/NoteContext";
import { useRequireAuth, TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Note } from "@/types/note";
import { EnhancedTierInfo } from "./EnhancedTierInfo";
import { NotesPageBreadcrumb } from "./NotesPageBreadcrumb";
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
    <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Breadcrumb Navigation - Improved spacing */}
        <div className="mb-6">
          <NotesPageBreadcrumb activeSubjectId={activeSubjectId} />
        </div>
        
        {/* Enhanced Tier Information Section - Better visual separation */}
        {userTier && tierLimits && (
          <div className="mb-8">
            <EnhancedTierInfo 
              userTier={userTier}
              tierLimits={tierLimits}
              notesCount={notes.length}
            />
          </div>
        )}
        
        {/* Notes Header Section - Improved spacing and layout */}
        <div className="mb-8">
          <NotesHeader 
            onSaveNote={onSaveNote}
            onScanNote={onScanNote}
            onImportNote={onImportNote}
            tierLimits={tierLimits}
            userTier={userTier}
          />
        </div>
        
        {/* Subject Tabs Section - Better visual hierarchy */}
        <div className="mb-8">
          <SubjectsSection 
            activeSubjectId={activeSubjectId}
            setActiveSubjectId={setActiveSubjectId}
            setFilterOptions={setFilterOptions}
            filteredNotesCount={filteredNotes.length}
          />
        </div>
        
        {/* Notes Grid and Pagination - Improved content area */}
        <div className="space-y-6">
          <NotesDisplay 
            notes={notes} 
            paginatedNotes={paginatedNotes} 
            loading={loading} 
          />
        </div>

        {/* Dialogs for Creating Notes */}
        <NoteCreationDialogs 
          onSaveNote={onSaveNote}
          onScanNote={onScanNote}
          onImportNote={onImportNote}
          tierLimits={tierLimits}
        />
      </div>
    </div>
  );
};
