
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
import { ErrorState } from "./ErrorState";

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
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  
  // Get notes data with proper error handling
  const notesContext = useNotes();
  
  // Get auth data with proper error handling
  const authContext = useRequireAuth();
  
  if (!notesContext) {
    return (
      <ErrorState 
        message="Notes system is not available. Please refresh the page."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!authContext) {
    return (
      <ErrorState 
        message="Authentication system is not available. Please refresh the page."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { 
    paginatedNotes = [], 
    notes = [], 
    loading = true, 
    setFilterOptions, 
    filteredNotes = [], 
    searchTerm = '', 
    filterOptions = {} 
  } = notesContext;

  const { user, loading: authLoading = true } = authContext;

  // Show loading state while checking authentication or loading notes
  if (authLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (loading) {
    return <LoadingState message="Loading your notes..." />;
  }

  // If not authenticated, the useRequireAuth hook will redirect
  if (!user) {
    return null;
  }

  // Check if notes are filtered
  const isFiltered = searchTerm.length > 0 || 
                    Boolean(filterOptions.dateFrom) || 
                    Boolean(filterOptions.dateTo) || 
                    Boolean(activeSubjectId);

  // Simple state handlers
  const handleSubjectChange = (subjectId: string | null) => {
    setActiveSubjectId(subjectId);
  };

  const handleFilterOptionsChange = (options: any) => {
    setFilterOptions(options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mint-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="backdrop-blur-sm bg-white/40 rounded-2xl border border-white/20 shadow-xl shadow-mint-500/5 p-8 space-y-10">
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-between">
            <NotesPageBreadcrumb activeSubjectId={activeSubjectId} />
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live sync enabled</span>
            </div>
          </div>
          
          {/* Enhanced Tier Information */}
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
          
          {/* Notes Header */}
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
          
          {/* Subject Tabs */}
          <div className="relative">
            <SubjectsSection 
              activeSubjectId={activeSubjectId}
              setActiveSubjectId={handleSubjectChange}
              setFilterOptions={handleFilterOptionsChange}
              filteredNotesCount={filteredNotes.length}
            />
          </div>
          
          {/* Notes Display */}
          <div className="relative min-h-[400px]">
            <NotesDisplay 
              notes={notes} 
              paginatedNotes={paginatedNotes} 
              loading={false}
              isFiltered={isFiltered}
              activeSubject={activeSubjectId || 'all'}
              onCreateNote={() => {}}
              onScanNote={() => {}}
              onImportNote={() => {}}
            />
          </div>
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
