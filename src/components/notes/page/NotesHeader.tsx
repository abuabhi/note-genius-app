
import React from "react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { NoteSorter } from "@/components/notes/NoteSorter";
import { FilterMenu } from "@/components/notes/FilterMenu";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Filter } from "lucide-react";
import { useNotes } from "@/contexts/NoteContext";
import { CreateNoteForm } from "./CreateNoteForm";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { ScanNoteDialog } from "../ScanNoteDialog";
import { ImportDialog } from "../import/ImportDialog";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Note } from "@/types/note";

interface NotesHeaderProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  tierLimits?: TierLimits | null;
  userTier?: UserTier;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({ 
  onSaveNote,
  onScanNote,
  onImportNote,
  tierLimits,
  userTier
}) => {
  const { searchTerm, setSearchTerm } = useNotes();
  const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = React.useState(false);

  // Check if OCR is enabled for the user's tier
  const isOCREnabled = tierLimits?.ocr_enabled ?? false;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-2">
          <NoteSearch />
        </div>
        <div className="flex gap-2">
          <Sheet open={isNewNoteSheetOpen} onOpenChange={setIsNewNoteSheetOpen}>
            <SheetTrigger asChild>
              <Button className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <CreateNoteForm 
                onSave={async (note) => {
                  const result = await onSaveNote(note);
                  if (result) setIsNewNoteSheetOpen(false);
                  return result !== null;
                }}
              />
            </SheetContent>
          </Sheet>

          <ScanNoteDialog onSaveNote={onScanNote} isPremiumUser={isOCREnabled} />
          
          <ImportDialog onSaveNote={onImportNote} />
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
