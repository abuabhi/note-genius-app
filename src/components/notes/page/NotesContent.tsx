
import { useState } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { NotesHeader } from "./NotesHeader";
import { useNotes } from "@/contexts/NoteContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const NotesContent = () => {
  const { paginatedNotes, addNote, notes, loading } = useNotes();
  const { toast } = useToast();
  const { isAuthorized, loading: authLoading, profile, tierLimits } = useRequireAuth();

  const handleAddNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    // Check if user has reached their note limit
    if (tierLimits && notes.length >= tierLimits.max_notes) {
      toast({
        title: "Note limit reached",
        description: `Your ${profile?.user_tier} tier allows a maximum of ${tierLimits.max_notes} notes. Upgrade your tier to add more notes.`,
        variant: "destructive",
      });
      return null;
    }
    return await addNote(note);
  };

  const handleScanNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    // Check if user's tier allows OCR
    if (tierLimits && !tierLimits.ocr_enabled) {
      toast({
        title: "Feature not available",
        description: `The scan feature requires ${profile?.user_tier === 'SCHOLAR' ? 'GRADUATE' : 'a higher'} tier. Please upgrade your tier to use this feature.`,
        variant: "destructive",
      });
      return null;
    }
    
    const result = await handleAddNote(note);
    if (result) {
      toast({
        title: "Note Created",
        description: "Your handwritten note has been converted and saved.",
      });
    }
    return result;
  };

  const handleImportNote = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    const result = await handleAddNote(note);
    if (result) {
      toast({
        title: "Note Created",
        description: "Your imported document has been saved as a note.",
      });
    }
    return result;
  };

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
      {profile && tierLimits && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-mint-700">Your Notes</h2>
              <p className="text-muted-foreground">
                <span className="font-medium">{profile.user_tier}</span> tier · {notes.length} of {tierLimits.max_notes} notes used
              </p>
            </div>
            {profile.user_tier !== 'DEAN' && (
              <a 
                href="/pricing" 
                className="mt-2 sm:mt-0 text-sm text-mint-600 hover:text-mint-800 font-medium"
              >
                Upgrade tier
              </a>
            )}
          </div>

          {showTierWarning && profile.user_tier !== 'DEAN' && (
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
        onSaveNote={handleAddNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
        tierLimits={tierLimits}
        userTier={profile?.user_tier}
      />
      <NotesGrid notes={paginatedNotes} />
      <NotePagination />
    </div>
  );
};
