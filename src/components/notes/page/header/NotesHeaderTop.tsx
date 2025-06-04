
import React from "react";
import { NoteSearch } from "@/components/notes/NoteSearch";
import { AddNoteButtonGroup } from "./AddNoteButtonGroup";
import { FilterMenu } from "@/components/notes/FilterMenu";
import { NoteSorter } from "@/components/notes/NoteSorter";

interface NotesHeaderTopProps {
  onOpenManualDialog: () => void;
  onOpenScanDialog: () => void;
  onOpenImportDialog: () => void;
}

export const NotesHeaderTop = ({
  onOpenManualDialog,
  onOpenScanDialog,
  onOpenImportDialog
}: NotesHeaderTopProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 mr-4">
        <NoteSearch />
      </div>
      <div className="flex gap-2 items-center">
        <AddNoteButtonGroup 
          onOpenManualDialog={onOpenManualDialog}
          onOpenScanDialog={onOpenScanDialog}
          onOpenImportDialog={onOpenImportDialog}
        />

        <FilterMenu />
        <NoteSorter />
      </div>
    </div>
  );
};
