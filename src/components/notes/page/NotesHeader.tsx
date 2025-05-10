
import React from "react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { NoteSorter } from "@/components/notes/NoteSorter";
import { FilterMenu } from "@/components/notes/FilterMenu";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Book } from "lucide-react";
import { useNotes } from "@/contexts/NoteContext";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { Note } from "@/types/note";
import { useNavigate } from "react-router-dom";
import { AddNoteDropdown } from "../AddNoteDropdown";

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
          {/* Only show the dropdown, not individual buttons */}
          <AddNoteDropdown
            onSaveNote={onSaveNote}
            onScanNote={onScanNote}
            onImportNote={onImportNote}
            isPremiumUser={isOCREnabled}
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
