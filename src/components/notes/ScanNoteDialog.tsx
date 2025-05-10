
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { ScanWorkflow } from "./scanning/ScanWorkflow";

interface ScanNoteDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
}

export const ScanNoteDialog = ({ 
  onSaveNote, 
  isPremiumUser = false,
  isVisible = false,
  onClose
}: ScanNoteDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(isVisible);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("eng"); // Default language is English

  // Sync internal state with props
  useEffect(() => {
    setIsDialogOpen(isVisible);
  }, [isVisible]);
  
  // When dialog is closed internally, also call the onClose prop if provided
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      {!isVisible && (
        <Button className="bg-mint-500 hover:bg-mint-600" onClick={() => setIsDialogOpen(true)}>
          <Camera className="mr-2 h-4 w-4" />
          Scan Note
        </Button>
      )}
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
          onSaveNote={onSaveNote}
          onClose={handleClose}
          selectedLanguage={detectedLanguage}
          setSelectedLanguage={setDetectedLanguage}
          isPremiumUser={isPremiumUser}
        />
      </DialogContent>
    </Dialog>
  );
};
