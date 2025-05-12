
import React from "react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { AddNoteButtonGroup } from "./AddNoteButtonGroup";
import { ConvertToFlashcardsButton } from "./ConvertToFlashcardsButton";
import { useNavigate } from "react-router-dom";

interface NotesHeaderTopProps {
  filteredNotesLength: number;
  onOpenManualDialog: () => void;
  onOpenScanDialog: () => void;
  onOpenImportDialog: () => void;
}

export const NotesHeaderTop = ({
  filteredNotesLength,
  onOpenManualDialog,
  onOpenScanDialog,
  onOpenImportDialog
}: NotesHeaderTopProps) => {
  const navigate = useNavigate();

  const handleNoteToFlashcard = () => {
    navigate("/note-to-flashcard");
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 mr-2">
        <NoteSearch />
      </div>
      <div className="flex gap-2">
        <AddNoteButtonGroup 
          onOpenManualDialog={onOpenManualDialog}
          onOpenScanDialog={onOpenScanDialog}
          onOpenImportDialog={onOpenImportDialog}
        />

        <ConvertToFlashcardsButton
          onClick={handleNoteToFlashcard}
          disabled={filteredNotesLength === 0}
        />
      </div>
    </div>
  );
};
