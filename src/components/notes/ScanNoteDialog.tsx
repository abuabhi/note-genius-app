
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Note } from "@/types/note";
import { ScanWorkflow } from "./scanning/ScanWorkflow";

interface ScanNoteDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<void>;
}

export const ScanNoteDialog = ({ onSaveNote }: ScanNoteDialogProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleClose = () => {
    setIsSheetOpen(false);
  };

  const handleSaveNote = async (note: Omit<Note, 'id'>) => {
    await onSaveNote(note);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button>
          <Camera className="mr-2 h-4 w-4" />
          Scan Note
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Scan Handwritten Note</SheetTitle>
          <SheetDescription>
            Capture or upload a photo of your handwritten notes to convert them to digital text.
          </SheetDescription>
        </SheetHeader>
        
        <ScanWorkflow 
          onSaveNote={handleSaveNote}
          onClose={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
};
