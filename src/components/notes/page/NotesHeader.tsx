
import React, { useState } from "react";
import { Note } from "@/types/note";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";
import { NotesHeaderTop } from "./header/NotesHeaderTop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateNoteForm } from "./CreateNoteForm";
import { ImportDialog } from "../import/ImportDialog";

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

  const handleManualSave = async (note: Omit<Note, 'id'>): Promise<Note | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    try {
      const result = await onSaveNote(note);
      if (result) {
        setIsManualDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error in manual save:", error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    if (isSubmitting) return false;
    
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Header Section - Search, Actions, Filters, and Sorting */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6 shadow-sm">
        <NotesHeaderTop 
          onOpenManualDialog={() => setIsManualDialogOpen(true)}
          onOpenImportDialog={() => setIsImportDialogOpen(true)}
        />
      </div>

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

      {/* Import Dialog */}
      <ImportDialog 
        onSaveNote={handleImportSave}
        isVisible={isImportDialogOpen}
        onClose={() => {
          if (!isSubmitting) setIsImportDialogOpen(false);
        }}
      />
    </div>
  );
};
