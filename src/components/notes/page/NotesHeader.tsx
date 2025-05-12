
import React, { useState } from "react";
import { Note } from "@/types/note";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { useNotes } from "@/contexts/NoteContext";
import { NotesHeaderTop } from "./header/NotesHeaderTop";
import { NotesHeaderBottom } from "./header/NotesHeaderBottom";
import { DialogManager } from "./header/DialogManager";

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
  
  // State to track which dialogs are open and submission status
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Section - Search and Action Buttons */}
      <NotesHeaderTop 
        filteredNotesLength={filteredNotes.length}
        onOpenManualDialog={() => setIsManualDialogOpen(true)}
        onOpenScanDialog={() => setIsScanDialogOpen(true)}
        onOpenImportDialog={() => setIsImportDialogOpen(true)}
      />
      
      {/* Bottom Section - Filters and Sorting */}
      <NotesHeaderBottom />

      {/* Dialogs for creating notes */}
      <DialogManager 
        onSaveNote={onSaveNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
        tierLimits={tierLimits}
        isManualDialogOpen={isManualDialogOpen}
        isScanDialogOpen={isScanDialogOpen}
        isImportDialogOpen={isImportDialogOpen}
        isSubmitting={isSubmitting}
        setIsManualDialogOpen={setIsManualDialogOpen}
        setIsScanDialogOpen={setIsScanDialogOpen}
        setIsImportDialogOpen={setIsImportDialogOpen}
      />
    </div>
  );
};
