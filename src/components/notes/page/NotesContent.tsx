
import { useState } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { NotesHeader } from "./NotesHeader";
import { useNotes } from "@/contexts/NoteContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { useRequireAuth } from "@/hooks/useRequireAuth"; 

export const NotesContent = () => {
  const { paginatedNotes, addNote, loading } = useNotes();
  const { toast } = useToast();
  const { isAuthorized, loading: authLoading } = useRequireAuth();

  const handleAddNote = async (note: Omit<Note, 'id'>) => {
    return await addNote(note);
  };

  const handleScanNote = async (note: Omit<Note, 'id'>) => {
    const result = await addNote(note);
    if (result) {
      toast({
        title: "Note Created",
        description: "Your handwritten note has been converted and saved.",
      });
    }
  };

  const handleImportNote = async (note: Omit<Note, 'id'>) => {
    const result = await addNote(note);
    if (result) {
      toast({
        title: "Note Created",
        description: "Your imported document has been saved as a note.",
      });
    }
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

  return (
    <div className="container mx-auto p-6">
      <NotesHeader 
        onSaveNote={handleAddNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
      />
      <NotesGrid notes={paginatedNotes} />
      <NotePagination />
    </div>
  );
};
