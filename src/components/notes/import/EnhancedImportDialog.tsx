
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
      <DialogContent className="max-w-4xl h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-mint-800">
            <Upload className="h-5 w-5 text-mint-600" />
            Import Document or Content
          </DialogTitle>
          <DialogDescription className="text-mint-600">
            Import content from various sources to create notes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-mint-50 border border-mint-200 flex-shrink-0">
            <TabsTrigger value="file" className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white">
              <Upload className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white">
              <Youtube className="h-4 w-4" />
              YouTube
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white">
              <Globe className="h-4 w-4" />
              Online
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white">
              <Camera className="h-4 w-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2 data-[state=active]:bg-mint-500 data-[state=active]:text-white">
              <FileStack className="h-4 w-4" />
              Bulk PDF
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="file" className="h-full overflow-y-auto">
              <FileImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
            </TabsContent>

            <TabsContent value="youtube" className="h-full overflow-y-auto">
              <YouTubeImportTab onImport={handleImport} />
            </TabsContent>

            <TabsContent value="api" className="h-full overflow-y-auto">
              <ApiImportTab onSaveNote={onSaveNote} />
            </TabsContent>

            <TabsContent value="scan" className="h-full overflow-y-auto">
              <ScanImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
            </TabsContent>

            <TabsContent value="bulk" className="h-full overflow-y-auto">
              <BulkPdfImportTab onSaveNote={onSaveNote} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
