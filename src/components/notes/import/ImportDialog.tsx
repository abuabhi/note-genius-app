
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
import { Note } from "@/types/note";
import { useImportState } from "./useImportState";

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
  const { 
    selectedFile, 
    processedText,
    documentTitle,
    setDocumentTitle,
    isProcessing,
    isSaving,
    handleFileSelected,
    processDocument,
    saveAsNote
  } = useImportState(onSaveNote, () => {
    setIsDialogOpen(false);
    if (onClose) onClose();
  });

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-mint-100 bg-white">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import notes from files or external services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="document-file" className="block text-sm font-medium mb-1">Select File</label>
            <input
              id="document-file"
              type="file"
              onChange={handleFileSelected}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {selectedFile && (
            <div className="p-4 border rounded bg-gray-50">
              <p className="font-medium">{selectedFile.name}</p>
              <Button 
                onClick={processDocument}
                disabled={isProcessing}
                className="mt-2"
              >
                {isProcessing ? 'Processing...' : 'Process Document'}
              </Button>
            </div>
          )}
        </div>
        
        {processedText && (
          <div className="mt-4">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium mb-1">Document Title</label>
              <input
                id="title"
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter a title for your note"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Content Preview</label>
              <div className="border border-gray-200 rounded p-4 max-h-60 overflow-y-auto bg-gray-50">
                <pre className="whitespace-pre-wrap text-sm">{processedText}</pre>
              </div>
            </div>
            
            <Button
              onClick={saveAsNote}
              disabled={isSaving || !documentTitle}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save as Note'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
