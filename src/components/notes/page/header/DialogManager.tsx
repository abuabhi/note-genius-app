
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateNoteForm } from "../CreateNoteForm";
import { EnhancedImportDialog } from "../../import/EnhancedImportDialog";
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
  
  const handleManualSave = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    if (isSubmitting) return null;
    
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

  const handleImportSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    if (isSubmitting) return false;
    
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
          </DialogHeader>
          <div className="py-2">
            <CreateNoteForm onSave={handleManualSave} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Import Dialog */}
      <EnhancedImportDialog 
        onSaveNote={handleImportSave}
        isVisible={isImportDialogOpen}
        onClose={() => {
          if (!isSubmitting) setIsImportDialogOpen(false);
        }}
        isPremiumUser={tierLimits?.ocr_enabled ?? false}
      />
    </>
  );
};
