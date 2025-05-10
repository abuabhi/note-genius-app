
import React from "react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { NoteSorter } from "@/components/notes/NoteSorter";
import { FilterMenu } from "@/components/notes/FilterMenu";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Filter, Book, ArrowRight } from "lucide-react";
import { useNotes } from "@/contexts/NoteContext";
import { CreateNoteForm } from "./CreateNoteForm";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { ScanNoteDialog } from "../ScanNoteDialog";
import { ImportDialog } from "../import/ImportDialog";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Note } from "@/types/note";
import { useNavigate } from "react-router-dom";

interface NotesHeaderProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  tierLimits?: TierLimits | null;
  userTier?: UserTier;
}

export const NotesHeader = ({
  onSaveNote,
  onScanNote,
  onImportNote,
  tierLimits,
  userTier
}: NotesHeaderProps) => {
  const { searchTerm, setSearchTerm, filteredNotes } = useNotes();
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  // Check if OCR is enabled for the user's tier
  const isOCREnabled = tierLimits?.ocr_enabled ?? false;

  // When passing to ImportDialog, convert the return type
  const handleImportSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onImportNote(note);
    return result !== null;
  };

  // Similarly for ScanNoteDialog
  const handleScanSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onScanNote(note);
    return result !== null;
  };

  // Navigate to the note to flashcard conversion page
  const handleNoteToFlashcard = () => {
    navigate("/note-to-flashcard");
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-2">
          <NoteSearch />
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap bg-mint-500 hover:bg-mint-600">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-mint-100">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a new note.
                </DialogDescription>
              </DialogHeader>
              <CreateNoteForm 
                onSave={async (note) => {
                  const result = await onSaveNote(note);
                  if (result) setIsNewNoteDialogOpen(false);
                  return result;
                }}
              />
            </DialogContent>
          </Dialog>

          <ScanNoteDialog 
            onSaveNote={handleScanSave} 
            isPremiumUser={isOCREnabled} 
          />
          
          <ImportDialog 
            onSaveNote={handleImportSave} 
          />

          <Button 
            variant="outline" 
            className="whitespace-nowrap border-mint-200 hover:bg-mint-50"
            onClick={handleNoteToFlashcard}
            disabled={filteredNotes.length === 0}
          >
            <FileText className="mr-1 h-4 w-4" />
            <ArrowRight className="mr-1 h-3 w-3" />
            <Book className="mr-2 h-4 w-4" />
            Convert to Flashcards
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterMenu />
          <NoteSorter />
        </div>
      </div>
    </div>
  );
};
