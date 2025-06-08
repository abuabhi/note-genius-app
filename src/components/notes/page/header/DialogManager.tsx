
import React from "react";
import { Note } from "@/types/note";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { AddNoteDialog } from "@/components/notes/AddNoteDialog";
import { ScanDialog } from "@/components/notes/scan/ScanDialog";
import { ImportDialog } from "@/components/notes/import/ImportDialog";

interface DialogManagerProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  tierLimits?: TierLimits | null;
  isManualDialogOpen: boolean;
  isScanDialogOpen: boolean;
  isImportDialogOpen: boolean;
  isSubmitting: boolean;
  setIsManualDialogOpen: (open: boolean) => void;
  setIsScanDialogOpen: (open: boolean) => void;
  setIsImportDialogOpen: (open: boolean) => void;
}

export const DialogManager = ({
  onSaveNote,
  onScanNote,
  onImportNote,
  tierLimits,
  isManualDialogOpen,
  isScanDialogOpen,
  isImportDialogOpen,
  isSubmitting,
  setIsManualDialogOpen,
  setIsScanDialogOpen,
  setIsImportDialogOpen
}: DialogManagerProps) => {
  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onSaveNote(noteData);
    return result !== null;
  };

  const handleScanNote = async (noteData: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onScanNote(noteData);
    return result !== null;
  };

  const handleImportNote = async (noteData: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onImportNote(noteData);
    return result !== null;
  };

  return (
    <>
      {/* Manual Note Dialog */}
      <AddNoteDialog 
        onSaveNote={handleSaveNote}
        isVisible={isManualDialogOpen}
        onClose={() => setIsManualDialogOpen(false)}
        tierLimits={tierLimits}
      />

      {/* Scan Dialog */}
      <ScanDialog
        onSaveNote={handleScanNote}
        isVisible={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
        tierLimits={tierLimits}
      />

      {/* Import Dialog */}
      <ImportDialog
        onSaveNote={handleImportNote}
        isVisible={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </>
  );
};
