
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateNoteForm } from "./CreateNoteForm";
import { ScanNoteDialog } from "../ScanNoteDialog";
import { ImportDialog } from "../import/ImportDialog";
import { Note } from "@/types/note";
import { TierLimits, UserTier } from "@/hooks/useRequireAuth";

interface NoteCreationDialogsProps {
  isManualDialogOpen: boolean;
  setIsManualDialogOpen: (open: boolean) => void;
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: (open: boolean) => void;
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  tierLimits?: TierLimits | null;
}

export const NoteCreationDialogs = ({
  isManualDialogOpen,
  setIsManualDialogOpen,
  isImportDialogOpen,
  setIsImportDialogOpen,
  onSaveNote,
  onScanNote,
  onImportNote,
  tierLimits
}: NoteCreationDialogsProps) => {
  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const result = await onSaveNote(noteData);
      if (result) {
        // Only close if successful
        setIsManualDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error in handleSaveNote:", error);
      return null;
    }
  };

  const handleScanNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const result = await onScanNote(noteData);
      if (result) {
        // Only close if successful
        setScanDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error in handleScanNote:", error);
      return null;
    }
  };

  const handleImportNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const result = await onImportNote(noteData);
      if (result) {
        // Only close if successful
        setIsImportDialogOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error in handleImportNote:", error);
      return null;
    }
  };

  return (
    <>
      {/* Create Note Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a New Note</DialogTitle>
          </DialogHeader>
          <CreateNoteForm onSave={handleSaveNote} />
        </DialogContent>
      </Dialog>

      {/* Scan Note Dialog */}
      <ScanNoteDialog
        isVisible={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onSaveNote={async (note) => {
          const result = await handleScanNote(note);
          return result !== null;
        }}
        isPremiumUser={tierLimits?.ocr_enabled ?? false}
      />

      {/* Import Note Dialog */}
      <ImportDialog
        isVisible={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSaveNote={async (note) => {
          const result = await handleImportNote(note);
          return result !== null;
        }}
      />
    </>
  );
};
