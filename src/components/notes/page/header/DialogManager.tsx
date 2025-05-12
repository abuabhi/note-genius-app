
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateNoteForm } from "../CreateNoteForm";
import { ScanNoteDialog } from "../../ScanNoteDialog";
import { ImportDialog } from "../../import/ImportDialog";
import { Note } from "@/types/note";
import { TierLimits } from "@/hooks/useRequireAuth";

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
  // Handle manual note save
  const handleManualSave = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const result = await onSaveNote(note);
      if (result) {
        setIsManualDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error in manual save:", error);
      return null;
    }
  };

  // Handle scan note save
  const handleScanSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    try {
      const result = await onScanNote(note);
      if (result) {
        setIsScanDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in scan save:", error);
      return false;
    }
  };

  // Handle import note save
  const handleImportSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    try {
      const result = await onImportNote(note);
      if (result) {
        setIsImportDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in import save:", error);
      return false;
    }
  };

  return (
    <>
      {/* Manual Entry Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) setIsManualDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-mint-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-mint-800">Create New Note</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill out the form below to create a new note.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <CreateNoteForm onSave={handleManualSave} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Dialog */}
      <ScanNoteDialog 
        onSaveNote={handleScanSave}
        isPremiumUser={tierLimits?.ocr_enabled ?? false}
        isVisible={isScanDialogOpen}
        onClose={() => {
          if (!isSubmitting) setIsScanDialogOpen(false);
        }}
      />
      
      {/* Import Dialog */}
      <ImportDialog 
        onSaveNote={handleImportSave}
        isVisible={isImportDialogOpen}
        onClose={() => {
          if (!isSubmitting) setIsImportDialogOpen(false);
        }}
      />
    </>
  );
};
