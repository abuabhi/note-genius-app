
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { ScanWorkflow } from "./scanning/ScanWorkflow";

interface ScanNoteDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanNoteDialog = ({ onSaveNote, isPremiumUser = false }: ScanNoteDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("eng"); // Default language is English

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleSaveNote = async (note: Omit<Note, 'id'>): Promise<boolean> => {
    return await onSaveNote(note);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-mint-500 hover:bg-mint-600">
          <Camera className="mr-2 h-4 w-4" />
          Scan Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-mint-100 bg-white">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Scan Handwritten Note</DialogTitle>
            {isPremiumUser && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-mint-400 to-mint-500 text-white text-xs font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </div>
          <DialogDescription>
            Capture or upload a photo of your handwritten notes to convert them to digital text.
            {isPremiumUser && " As a premium user, you can use OpenAI for enhanced OCR accuracy."}
          </DialogDescription>
        </DialogHeader>
        
        <ScanWorkflow 
          onSaveNote={handleSaveNote}
          onClose={handleClose}
          selectedLanguage={detectedLanguage}
          setSelectedLanguage={setDetectedLanguage}
          isPremiumUser={isPremiumUser}
        />
      </DialogContent>
    </Dialog>
  );
};
