
import React from "react";
import { Note } from "@/types/note";
import { TierLimits } from "@/hooks/useRequireAuth";
import { ScanNoteDialog } from "@/components/notes/ScanNoteDialog";
import { ImportDialog } from "@/components/notes/import/ImportDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateNoteForm } from "../CreateNoteForm";

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
  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const result = await onSaveNote(noteData);
      if (result) {
        setIsManualDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error in handleSaveNote:", error);
      return null;
    }
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
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a New Note</DialogTitle>
          </DialogHeader>
          <CreateNoteForm onSave={handleSaveNote} />
        </DialogContent>
      </Dialog>

      {/* Scan Dialog */}
      <ScanNoteDialog
        onSaveNote={handleScanNote}
        isVisible={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
        isPremiumUser={tierLimits?.ocr_enabled ?? false}
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
