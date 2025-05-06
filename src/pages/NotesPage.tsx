
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { ScanNoteDialog } from "@/components/notes/ScanNoteDialog";
import { NoteProvider, useNotes } from "@/contexts/NoteContext";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const NotesContent = () => {
  const { filteredNotes, addNote } = useNotes();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteDescription, setNewNoteDescription] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("Uncategorized");
  const { toast } = useToast();
  
  const handleAddNote = () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your note.",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    const newNote = {
      id: Date.now().toString(),
      title: newNoteTitle,
      description: newNoteDescription,
      date: dateString,
      category: newNoteCategory,
      sourceType: 'manual' as const,
    };
    
    addNote(newNote);
    setNewNoteTitle("");
    setNewNoteDescription("");
    setNewNoteCategory("Uncategorized");
    
    toast({
      title: "Note Created",
      description: "Your note has been created successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
          <NoteSearch />
          <div className="flex gap-2">
            <Sheet>
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
                  <Button onClick={handleAddNote}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Note
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            
            <ScanNoteDialog onSaveNote={addNote} />
          </div>
        </div>
      </div>
      <NotesGrid notes={filteredNotes} />
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
