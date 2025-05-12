
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PlusCircle, FileText, Camera, Import } from "lucide-react";
import { Note } from "@/types/note";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateNoteForm } from "./page/CreateNoteForm";
import { ScanNoteDialog } from "./ScanNoteDialog";
import { ImportDialog } from "./import/ImportDialog";

interface AddNoteDropdownProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  isPremiumUser?: boolean;
}

export const AddNoteDropdown: React.FC<AddNoteDropdownProps> = ({
  onSaveNote,
  onScanNote,
  onImportNote,
  isPremiumUser = false
}) => {
  // State for dialog visibility
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When passing to ScanNoteDialog, convert the return type
  const handleScanSave = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    if (isSubmitting) return false;
    
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Similarly for ImportDialog
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-mint-500 hover:bg-mint-600 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 z-50">
          <DropdownMenuItem onClick={() => setIsManualDialogOpen(true)} className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            <span>Manual Entry</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsScanDialogOpen(true)} className="cursor-pointer">
            <Camera className="mr-2 h-4 w-4" />
            <span>Scan Note</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)} className="cursor-pointer">
            <Import className="mr-2 h-4 w-4" />
            <span>Import Document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      {/* Scan Dialog is handled by its own component */}
      <ScanNoteDialog 
        onSaveNote={handleScanSave} 
        isPremiumUser={isPremiumUser} 
        isVisible={isScanDialogOpen}
        onClose={() => {
          if (!isSubmitting) setIsScanDialogOpen(false);
        }}
      />
      
      {/* Import Dialog is handled by its own component */}
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
