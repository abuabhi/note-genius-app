
import { useState } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { NotesHeader } from "./NotesHeader";
import { useNotes } from "@/contexts/NoteContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { useRequireAuth, TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CreateNoteForm } from "./CreateNoteForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScanNoteDialog } from "../ScanNoteDialog";
import { ImportDialog } from "../import/ImportDialog";
import { SubjectTabs } from "./SubjectTabs";
import { useEffect } from "react";
import { useUserSubjects } from "@/hooks/useUserSubjects";

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
  const { toast } = useToast();
  const { user, loading: authLoading } = useRequireAuth();
  const isAuthorized = !!user;
  const { subjects, isLoading: loadingSubjects } = useUserSubjects();
  
  // State for dialog visibility
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // When subject changes, update the filter
  useEffect(() => {
    // Set filter based on active subject
    if (activeSubjectId) {
      // Log for debugging
      console.log(`Setting filter for subject: ${activeSubjectId}`);
      console.log(`Notes with subject_id: ${notes.filter(note => note.subject_id === activeSubjectId).length}`);
      
      setFilterOptions(prev => ({
        ...prev,
        subjectId: activeSubjectId
      }));
    } else {
      // Remove subject filter if "All" is selected
      setFilterOptions(prev => {
        const newFilters = { ...prev };
        delete newFilters.subjectId;
        return newFilters;
      });
    }
  }, [activeSubjectId, setFilterOptions, notes]);

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

  // When passing to ScanNoteDialog, convert the return type
  const handleScanSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onScanNote(note);
    return result !== null;
  };

  // Similarly for ImportDialog
  const handleImportSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onImportNote(note);
    return result !== null;
  };

  // Display tier limit warning if user is approaching their limit
  const showTierWarning = tierLimits && notes.length >= tierLimits.max_notes * 0.8;

  return (
    <div className="container mx-auto p-6">
      {userTier && tierLimits && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-mint-800">Your Notes</h2>
              <p className="text-muted-foreground">
                <span className="font-medium">{userTier}</span> tier · {notes.length} of {tierLimits.max_notes} notes used
              </p>
            </div>
            {userTier !== 'DEAN' && (
              <a 
                href="/pricing" 
                className="mt-2 sm:mt-0 text-sm text-mint-600 hover:text-mint-800 font-medium"
              >
                Upgrade tier
              </a>
            )}
          </div>

          {showTierWarning && userTier !== 'DEAN' && (
            <Alert className="mb-4 border-mint-300 bg-mint-50">
              <AlertCircle className="h-4 w-4 text-mint-600" />
              <AlertTitle className="text-mint-800">You're approaching your notes limit</AlertTitle>
              <AlertDescription className="text-mint-700">
                You've used {notes.length} of your {tierLimits.max_notes} available notes.
                Consider upgrading your tier to continue adding more notes.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      <NotesHeader 
        onSaveNote={onSaveNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
        tierLimits={tierLimits}
        userTier={userTier}
      />
      
      {/* Subject Tabs */}
      {!loadingSubjects && subjects.length > 0 && (
        <div className="mb-6">
          <SubjectTabs 
            activeSubjectId={activeSubjectId} 
            onSubjectChange={setActiveSubjectId} 
          />
        </div>
      )}
      
      {/* Debugging counts */}
      {activeSubjectId && (
        <div className="text-xs text-mint-500 mb-2">
          Showing {filteredNotes.length} notes for selected subject
        </div>
      )}
      
      {notes.length === 0 && !loading ? (
        <div className="text-center py-10 bg-mint-50 rounded-lg border border-mint-200 shadow-sm">
          <p className="text-lg text-mint-600 mb-2">No notes found</p>
          <p className="text-sm text-muted-foreground">Create your first note by clicking the "New Note" button above.</p>
        </div>
      ) : (
        <>
          <NotesGrid notes={paginatedNotes} />
          <NotePagination />
        </>
      )}

      {/* Manual Entry Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-mint-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-mint-800">Create New Note</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill out the form below to create a new note.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <CreateNoteForm 
              onSave={async (note) => {
                const result = await onSaveNote(note);
                if (result) setIsManualDialogOpen(false);
                return result;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Dialog is handled by its own component */}
      <ScanNoteDialog 
        onSaveNote={handleScanSave} 
        isPremiumUser={tierLimits?.ocr_enabled ?? false} 
        isVisible={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
      />
      
      {/* Import Dialog is handled by its own component */}
      <ImportDialog 
        onSaveNote={handleImportSave}
        isVisible={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
};
