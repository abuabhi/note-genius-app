
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
  const { paginatedNotes, notes, loading, setFilterOptions, filteredNotes, searchTerm, filterOptions } = useNotes();
  const { user, loading: authLoading } = useRequireAuth();
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Check if notes are filtered - properly handle Date types
  const isFiltered = searchTerm.length > 0 || 
                    Boolean(filterOptions.dateFrom) || 
                    Boolean(filterOptions.dateTo) || 
                    Boolean(activeSubjectId);

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // If not authenticated, the useRequireAuth hook will redirect
  if (!user) {
    return null;
  }

  // Create wrapper functions that don't expect arguments
  const handleCreateNote = () => {
    // This will be handled by the dialog opening
  };

  const handleScanNote = () => {
    // This will be handled by the dialog opening
  };

  const handleImportNote = () => {
    // This will be handled by the dialog opening
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mint-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Glass morphism container with modern spacing */}
        <div className="backdrop-blur-sm bg-white/40 rounded-2xl border border-white/20 shadow-xl shadow-mint-500/5 p-8 space-y-10">
          
          {/* Breadcrumb with modern styling */}
          <div className="flex items-center justify-between">
            <NotesPageBreadcrumb activeSubjectId={activeSubjectId} />
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live sync enabled</span>
            </div>
          </div>
          
          {/* Enhanced Tier Information with modern card design */}
          {userTier && tierLimits && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-mint-400/10 to-blue-400/10 rounded-xl blur-xl"></div>
              <div className="relative">
                <EnhancedTierInfo 
                  userTier={userTier}
                  tierLimits={tierLimits}
                  notesCount={notes.length}
                />
              </div>
            </div>
          )}
          
          {/* Notes Header with enhanced design */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-mint-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg">
              <NotesHeader 
                onSaveNote={onSaveNote}
                onScanNote={onScanNote}
                onImportNote={onImportNote}
                tierLimits={tierLimits}
                userTier={userTier}
              />
            </div>
          </div>
          
          {/* Subject Tabs with modern design */}
          <div className="relative">
            <SubjectsSection 
              activeSubjectId={activeSubjectId}
              setActiveSubjectId={setActiveSubjectId}
              setFilterOptions={setFilterOptions}
              filteredNotesCount={filteredNotes.length}
            />
          </div>
          
          {/* Notes Display with enhanced container */}
          <div className="relative min-h-[400px]">
            <NotesDisplay 
              notes={notes} 
              paginatedNotes={paginatedNotes} 
              loading={loading}
              isFiltered={isFiltered}
              activeSubject={activeSubjectId || 'all'}
              onCreateNote={handleCreateNote}
              onScanNote={handleScanNote}
              onImportNote={handleImportNote}
            />
          </div>
        </div>

        {/* Floating action indicator */}
        <div className="fixed bottom-8 right-8 hidden lg:flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-mint-100/50">
          <div className="w-2 h-2 bg-mint-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-600">Ready to create</span>
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
