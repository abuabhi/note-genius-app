
import { useState, useEffect } from "react";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { NotesHeader } from "./NotesHeader";
import { useNotes } from "@/contexts/NoteContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const NotesContent = () => {
  const { paginatedNotes, addNote, loading } = useNotes();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session !== null;
  };

  useEffect(() => {
    const checkUserAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view and create notes.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    
    checkUserAuth();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading your notes...</p>
        </div>
      </div>
    );
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
