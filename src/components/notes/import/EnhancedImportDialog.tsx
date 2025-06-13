
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImportTab } from './tabs/FileImportTab';
import { ApiImportTab } from './tabs/ApiImportTab';
import { ScanImportTab } from './tabs/ScanImportTab';
import { YouTubeImportTab } from './tabs/YouTubeImportTab';
import { BulkPdfImportTab } from './tabs/BulkPdfImportTab';
import { Upload } from 'lucide-react';

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

  const handleImport = async (noteData: any): Promise<boolean> => {
    const success = await onSaveNote(noteData);
    if (success) {
      onClose();
    }
    return success;
  };

  const tabs = [
    { value: 'file', label: 'Files' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'api', label: 'Online' },
    { value: 'scan', label: 'Scan' },
    { value: 'bulk', label: 'Bulk PDF' }
  ];

  return (
    <>
      <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Compact Header */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-mint-500 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Import Content
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Add notes from files, services, or scanned documents
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Compact Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col px-6">
            <div className="mb-4">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-lg p-1 h-10">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value}
                    className="text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-mint-600 data-[state=active]:shadow-sm rounded-md py-2"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden pb-6">
              <div className="h-full overflow-y-auto">
                <TabsContent value="file" className="h-full mt-0">
                  <FileImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
                </TabsContent>

                <TabsContent value="youtube" className="h-full mt-0">
                  <YouTubeImportTab onImport={handleImport} />
                </TabsContent>

                <TabsContent value="api" className="h-full mt-0">
                  <ApiImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
                </TabsContent>

                <TabsContent value="scan" className="h-full mt-0">
                  <ScanImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
                </TabsContent>

                <TabsContent value="bulk" className="h-full mt-0">
                  <BulkPdfImportTab onSaveNote={onSaveNote} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
