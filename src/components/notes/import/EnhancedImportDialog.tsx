
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Import, FileText, Camera, Zap } from "lucide-react";
import { Note } from "@/types/note";
import { FileImportTab } from "./tabs/FileImportTab";
import { ApiImportTab } from "./tabs/ApiImportTab";
import { BulkPdfImportTab } from "./tabs/BulkPdfImportTab";
import { ScanImportTab } from "./tabs/ScanImportTab";

interface EnhancedImportDialogProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isVisible?: boolean;
  onClose?: () => void;
  isPremiumUser?: boolean;
}

export const EnhancedImportDialog: React.FC<EnhancedImportDialogProps> = ({ 
  onSaveNote, 
  isVisible = false,
  onClose,
  isPremiumUser = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(isVisible);
  const [activeTab, setActiveTab] = useState('file');

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-purple-100 bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-purple-600" />
            Import Documents & Content
          </DialogTitle>
          <DialogDescription>
            Import notes from various sources including PDFs, documents, APIs, and scanned content
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Single File
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Bulk PDF
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan/OCR
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Import className="h-4 w-4" />
              API Import
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="mt-6">
            <FileImportTab
              onSaveNote={onSaveNote}
              isPremiumUser={isPremiumUser}
            />
          </TabsContent>
          
          <TabsContent value="bulk" className="mt-6">
            <BulkPdfImportTab
              onSaveNote={onSaveNote}
              isPremiumUser={isPremiumUser}
            />
          </TabsContent>
          
          <TabsContent value="scan" className="mt-6">
            <ScanImportTab
              onSaveNote={onSaveNote}
              isPremiumUser={isPremiumUser}
            />
          </TabsContent>
          
          <TabsContent value="api" className="mt-6">
            <ApiImportTab 
              onSaveNote={onSaveNote}
              isPremiumUser={isPremiumUser}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
