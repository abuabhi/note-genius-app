
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
  const { paginatedNotes, notes, loading } = useNotes();
  const { toast } = useToast();
  const { user, loading: authLoading } = useRequireAuth();
  const isAuthorized = !!user;

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the useRequireAuth hook will redirect
  if (!isAuthorized) {
    return null;
  }

  // Display tier limit warning if user is approaching their limit
  const showTierWarning = tierLimits && notes.length >= tierLimits.max_notes * 0.8;

  return (
    <div className="container mx-auto p-6">
      {userTier && tierLimits && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-mint-700">Your Notes</h2>
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
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>You're approaching your notes limit</AlertTitle>
              <AlertDescription>
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
      
      {notes.length === 0 && !loading ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-lg text-mint-600 mb-2">No notes found</p>
          <p className="text-sm text-muted-foreground">Create your first note by clicking the "New Note" button above.</p>
        </div>
      ) : (
        <>
          <NotesGrid notes={paginatedNotes} />
          <NotePagination />
        </>
      )}
    </div>
  );
};
