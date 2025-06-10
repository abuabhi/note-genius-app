
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImportTab } from './tabs/FileImportTab';
import { ApiImportTab } from './tabs/ApiImportTab';
import { ScanImportTab } from './tabs/ScanImportTab';
import { YouTubeImportTab } from './tabs/YouTubeImportTab';
import { BulkPdfImportTab } from './tabs/BulkPdfImportTab';
import { Upload, Globe, Camera, Youtube, FileStack } from 'lucide-react';

interface EnhancedImportDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const EnhancedImportDialog = ({
  isVisible,
  onClose,
  onSaveNote,
  isPremiumUser = false
}: EnhancedImportDialogProps) => {
  const [activeTab, setActiveTab] = useState('file');

  const handleImport = async (noteData: any) => {
    const success = await onSaveNote(noteData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Document or Content
          </DialogTitle>
          <DialogDescription>
            Import content from various sources to create notes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Online
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileStack className="h-4 w-4" />
              Bulk PDF
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="file" className="space-y-4">
              <FileImportTab onImport={handleImport} />
            </TabsContent>

            <TabsContent value="youtube" className="space-y-4">
              <YouTubeImportTab onImport={handleImport} />
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <ApiImportTab onImport={handleImport} />
            </TabsContent>

            <TabsContent value="scan" className="space-y-4">
              <ScanImportTab onImport={handleImport} isPremiumUser={isPremiumUser} />
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <BulkPdfImportTab onImport={handleImport} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
