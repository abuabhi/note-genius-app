
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { ScanWorkflow } from "./scanning/ScanWorkflow";

interface ScanNoteDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<void>;
  isPremiumUser?: boolean;
}

export const ScanNoteDialog = ({ onSaveNote, isPremiumUser = false }: ScanNoteDialogProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("eng"); // Default language is English

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
          <div className="flex items-center gap-2">
            <SheetTitle>Scan Handwritten Note</SheetTitle>
            {isPremiumUser && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </div>
          <SheetDescription>
            Capture or upload a photo of your handwritten notes to convert them to digital text.
            {isPremiumUser && " As a premium user, you can use OpenAI for enhanced OCR accuracy."}
          </SheetDescription>
        </SheetHeader>
        
        <ScanWorkflow 
          onSaveNote={handleSaveNote}
          onClose={handleClose}
          selectedLanguage={detectedLanguage}
          setSelectedLanguage={setDetectedLanguage}
          isPremiumUser={isPremiumUser}
        />
      </SheetContent>
    </Sheet>
  );
};
