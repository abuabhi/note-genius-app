
import React, { useState } from "react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { NoteSorter } from "@/components/notes/NoteSorter";
import { FilterMenu } from "@/components/notes/FilterMenu";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Book, ChevronDown, PlusCircle, Camera, Import } from "lucide-react";
import { useNotes } from "@/contexts/NoteContext";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Note } from "@/types/note";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateNoteForm } from "./CreateNoteForm";
import { ScanNoteDialog } from "../ScanNoteDialog";
import { ImportDialog } from "../import/ImportDialog";

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
  const { filteredNotes } = useNotes();
  const navigate = useNavigate();
  
  // State to track which dialogs are open
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Check if OCR is enabled for the user's tier
  const isOCREnabled = tierLimits?.ocr_enabled ?? false;

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
          <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
            <Button 
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 bg-mint-500 hover:bg-mint-600 text-white"
              onClick={() => setIsManualDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Note
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 bg-mint-500 hover:bg-mint-600 text-white"
                  size="icon"
                  aria-label="Add Note Options"
                >
                  <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="max-w-64 md:max-w-xs bg-white"
                side="bottom"
                sideOffset={4}
                align="end"
              >
                <DropdownMenuItem onClick={() => setIsManualDialogOpen(true)} className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Manual Entry</span>
                    <span className="text-xs text-muted-foreground">Create a note by typing content manually</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsScanDialogOpen(true)} className="cursor-pointer">
                  <Camera className="mr-2 h-4 w-4" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Scan Note</span>
                    <span className="text-xs text-muted-foreground">Create a note by scanning physical documents</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)} className="cursor-pointer">
                  <Import className="mr-2 h-4 w-4" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Import Document</span>
                    <span className="text-xs text-muted-foreground">Create a note by importing a document</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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

      {/* Scan Dialog */}
      <ScanNoteDialog 
        onSaveNote={async (note) => {
          const result = await onScanNote(note);
          if (result) setIsScanDialogOpen(false);
          return result !== null;
        }}
        isPremiumUser={isOCREnabled}
        isVisible={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
      />
      
      {/* Import Dialog */}
      <ImportDialog 
        onSaveNote={async (note) => {
          const result = await onImportNote(note);
          if (result) setIsImportDialogOpen(false);
          return result !== null;
        }}
        isVisible={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
};
