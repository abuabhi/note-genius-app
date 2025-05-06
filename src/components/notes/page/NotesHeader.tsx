
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Archive, FileUp, Plus } from "lucide-react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { ScanNoteDialog } from "@/components/notes/ScanNoteDialog";
import { ImportDialog } from "@/components/notes/import/ImportDialog";
import { CreateNoteForm } from "./CreateNoteForm";
import { Note } from "@/types/note";
import { useState } from "react";
import { useNotes } from "@/contexts/NoteContext";
import { Toggle } from "@/components/ui/toggle";
import { FilterMenu } from "@/components/notes/FilterMenu";

interface NotesHeaderProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<any>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<void>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<void>;
}

export const NotesHeader = ({ onSaveNote, onScanNote, onImportNote }: NotesHeaderProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { showArchived, setShowArchived } = useNotes();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold">My Notes</h1>
      <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
        <div className="flex flex-1 gap-2">
          <NoteSearch />
          <FilterMenu />
        </div>
        <div className="flex gap-2">
          <Toggle 
            pressed={showArchived}
            onPressedChange={setShowArchived}
            className="flex items-center"
            aria-label="Toggle archived notes"
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? "Viewing Archive" : "Show Archive"}
          </Toggle>
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
              <CreateNoteForm 
                onAddNote={onSaveNote}
                onSuccess={() => setIsSheetOpen(false)} 
              />
            </SheetContent>
          </Sheet>
          
          <ScanNoteDialog onSaveNote={onScanNote} />
          <ImportDialog onSaveNote={onImportNote} />
        </div>
      </div>
    </div>
  );
};
