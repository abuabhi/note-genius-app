
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

  const handleImport = async (noteData: any) => {
    const success = await onSaveNote(noteData);
    if (success) {
      onClose();
    }
  };

  const tabs = [
    { value: 'file', label: 'Files' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'api', label: 'Online' },
    { value: 'scan', label: 'Scan' },
    { value: 'bulk', label: 'Bulk PDF' }
  ];

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-white/95 backdrop-blur-lg border-0 shadow-2xl shadow-mint-500/20 rounded-2xl overflow-hidden animate-scale-in">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-mint-50/30 via-white/50 to-mint-100/20 -z-10" />
        
        {/* Header with Animation */}
        <DialogHeader className="flex-shrink-0 px-8 pt-8 pb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-mint-500/5 to-transparent -z-10" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Import Document or Content
              </DialogTitle>
              <div className="h-1 w-24 bg-gradient-to-r from-mint-500 to-mint-300 rounded-full mt-2 animate-fade-in" />
            </div>
          </div>
          <DialogDescription className="text-gray-600 text-base leading-relaxed animate-fade-in">
            Import content from various sources to create notes. Choose from files, online services, scanning, or bulk operations.
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col px-8">
          <div className="relative mb-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-2 shadow-lg relative overflow-hidden">
              {/* Animated Tab Indicator */}
              <div 
                className="absolute top-2 bottom-2 bg-gradient-to-r from-mint-500 to-mint-600 rounded-lg shadow-md transition-all duration-300 ease-out"
                style={{
                  width: '18%',
                  left: `${2 + (tabs.findIndex(tab => tab.value === activeTab) * 19.2)}%`,
                }}
              />
              
              {tabs.map((tab, index) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="relative z-10 font-semibold text-gray-700 data-[state=active]:text-white data-[state=active]:shadow-none transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content Area with Scroll */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
              <TabsContent value="file" className="h-full animate-fade-in">
                <FileImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
              </TabsContent>

              <TabsContent value="youtube" className="h-full animate-fade-in">
                <YouTubeImportTab onImport={handleImport} />
              </TabsContent>

              <TabsContent value="api" className="h-full animate-fade-in">
                <ApiImportTab onSaveNote={onSaveNote} />
              </TabsContent>

              <TabsContent value="scan" className="h-full animate-fade-in">
                <ScanImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
              </TabsContent>

              <TabsContent value="bulk" className="h-full animate-fade-in">
                <BulkPdfImportTab onSaveNote={onSaveNote} />
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #10b981, #059669);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #059669, #047857);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
