
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { ImportTabs } from "./tabs/ImportTabs";
import { Note } from "@/types/note";

interface ImportDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isVisible?: boolean;
  onClose?: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ 
  onSaveNote, 
  isVisible = false,
  onClose
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(isVisible);

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

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      {!isVisible && (
        <Button className="bg-mint-500 hover:bg-mint-600" onClick={() => setIsDialogOpen(true)}>
          <Import className="mr-2 h-4 w-4" />
          Import
        </Button>
      )}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-mint-100 bg-white">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import notes from files or external services
          </DialogDescription>
        </DialogHeader>

        <ImportTabs 
          onSaveNote={onSaveNote} 
          onClose={() => {
            setIsDialogOpen(false);
            if (onClose) onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
