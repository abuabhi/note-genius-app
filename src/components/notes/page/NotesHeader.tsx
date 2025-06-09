
import React, { useState } from "react";
import { Note } from "@/types/note";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { NotesHeaderTop } from "./header/NotesHeaderTop";
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
  // State to track which dialogs are open and submission status
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-6">
      {/* Unified Header Section - Search, Actions, Filters, and Sorting */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6 shadow-sm">
        <NotesHeaderTop 
          onOpenManualDialog={() => setIsManualDialogOpen(true)}
          onOpenImportDialog={() => setIsImportDialogOpen(true)}
        />
      </div>

      {/* Dialogs for creating notes */}
      <DialogManager 
        onSaveNote={onSaveNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
        tierLimits={tierLimits}
        isManualDialogOpen={isManualDialogOpen}
        isScanDialogOpen={false}
        isImportDialogOpen={isImportDialogOpen}
        isSubmitting={isSubmitting}
        setIsManualDialogOpen={setIsManualDialogOpen}
        setIsScanDialogOpen={() => {}}
        setIsImportDialogOpen={setIsImportDialogOpen}
      />
    </div>
  );
};
