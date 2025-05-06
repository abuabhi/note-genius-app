
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { NotePagination } from "@/components/notes/NotePagination";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Loader2 } from "lucide-react";
import { ScanNoteDialog } from "@/components/notes/ScanNoteDialog";
import { NoteProvider, useNotes } from "@/contexts/NoteContext";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const NotesContent = () => {
  const { paginatedNotes, addNote, loading } = useNotes();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteDescription, setNewNoteDescription] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("Uncategorized");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleAddNote = async () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your note.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingNote(true);
    
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    const newNote: Omit<Note, 'id'> = {
      title: newNoteTitle,
      description: newNoteDescription,
      date: dateString,
      category: newNoteCategory,
      sourceType: 'manual',
    };
    
    const result = await addNote(newNote);
    
    setIsCreatingNote(false);
    
    if (result) {
      setNewNoteTitle("");
      setNewNoteDescription("");
      setNewNoteCategory("Uncategorized");
      setIsSheetOpen(false);
      
      toast({
        title: "Note Created",
        description: "Your note has been created successfully.",
      });
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
          <NoteSearch />
          <div className="flex gap-2">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Create New Note</SheetTitle>
                  <SheetDescription>
                    Add a new note to your collection.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Enter note title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <Input
                      id="category"
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value)}
                      placeholder="Enter category"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={newNoteDescription}
                      onChange={(e) => setNewNoteDescription(e.target.value)}
                      placeholder="Enter note description"
                      rows={5}
                    />
                  </div>
                </div>
                <SheetFooter>
                  <Button onClick={handleAddNote} disabled={isCreatingNote}>
                    {isCreatingNote ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Create Note
                      </>
                    )}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <ScanNoteDialog onSaveNote={handleScanNote} />
          </div>
        </div>
      </div>
      <NotesGrid notes={paginatedNotes} />
      <NotePagination />
    </div>
  );
};

const NotesPage = () => {
  return (
    <Layout>
      <NoteProvider>
        <NotesContent />
      </NoteProvider>
    </Layout>
  );
};

export default NotesPage;
