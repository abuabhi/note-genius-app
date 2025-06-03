
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
    <div className="space-y-6">
      {/* Top Section - Search and Action Buttons with improved layout */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6 shadow-sm">
        <NotesHeaderTop 
          filteredNotesLength={filteredNotes.length}
          onOpenManualDialog={() => setIsManualDialogOpen(true)}
          onOpenScanDialog={() => setIsScanDialogOpen(true)}
          onOpenImportDialog={() => setIsImportDialogOpen(true)}
        />
      </div>
      
      {/* Bottom Section - Filters and Sorting with better spacing */}
      <div className="bg-white/40 backdrop-blur-sm rounded-lg border border-mint-100 p-4 shadow-sm">
        <NotesHeaderBottom />
      </div>

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
