
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
      <DialogContent className="max-w-4xl h-[600px] flex flex-col bg-gradient-to-br from-gray-50 to-mint-50/20 backdrop-blur-sm border-mint-100 shadow-lg">
        <DialogHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Upload className="h-4 w-4 text-gray-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Import Document or Content
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 text-sm leading-relaxed">
            Import content from various sources to create notes. Choose from files, online services, scanning, or bulk operations.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 border border-gray-200 flex-shrink-0 p-1 rounded-lg">
            <TabsTrigger 
              value="file" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-mint-500 data-[state=active]:shadow-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
            >
              Files
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-mint-500 data-[state=active]:shadow-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
            >
              YouTube
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-mint-500 data-[state=active]:shadow-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
            >
              Online
            </TabsTrigger>
            <TabsTrigger 
              value="scan" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-mint-500 data-[state=active]:shadow-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
            >
              Scan
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-mint-500 data-[state=active]:shadow-sm font-medium text-gray-700 data-[state=active]:text-gray-900"
            >
              Bulk PDF
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6 overflow-hidden">
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
