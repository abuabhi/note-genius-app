
import { useState } from "react";
import { Note } from "@/types/note";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateNoteForm } from "./CreateNoteForm";
import { ScanNoteDialog } from "../ScanNoteDialog";
import { ImportDialog } from "../import/ImportDialog";

interface NoteCreationDialogsProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  tierLimits?: { ocr_enabled?: boolean } | null;
}

export const NoteCreationDialogs = ({ 
  onSaveNote, 
  onScanNote, 
  onImportNote,
  tierLimits,
}: NoteCreationDialogsProps) => {
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // Check if OCR is enabled for the user's tier
  const isOCREnabled = tierLimits?.ocr_enabled ?? false;
  
  // When passing to ScanNoteDialog, convert the return type
  const handleScanSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onScanNote(note);
    return result !== null;
  };

  // Similarly for ImportDialog
  const handleImportSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    const result = await onImportNote(note);
    return result !== null;
  };
  
  return (
    <>
      {/* Manual Entry Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-mint-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-mint-800">Create New Note</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill out the form below to create a new note.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <CreateNoteForm 
              onSave={async (note) => {
                const result = await onSaveNote(note);
                if (result) setIsManualDialogOpen(false);
                return result;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Dialog */}
      <ScanNoteDialog 
        onSaveNote={handleScanSave}
        isPremiumUser={isOCREnabled}
        isVisible={isScanDialogOpen}
        onClose={() => setIsScanDialogOpen(false)}
      />
      
      {/* Import Dialog */}
      <ImportDialog 
        onSaveNote={handleImportSave}
        isVisible={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </>
  );
};
