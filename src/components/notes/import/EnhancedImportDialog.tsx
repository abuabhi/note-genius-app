
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImportTab } from './tabs/FileImportTab';
import { ApiImportTab } from './tabs/ApiImportTab';
import { ScanImportTab } from './tabs/ScanImportTab';
import { YouTubeImportTab } from './tabs/YouTubeImportTab';
import { BulkPdfImportTab } from './tabs/BulkPdfImportTab';
import { Upload, Sparkles } from 'lucide-react';

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
    <>
      <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-mint-500/10 rounded-3xl overflow-hidden animate-scale-in">
          {/* Glassmorphism Background with Animated Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/40 via-white/60 to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-mint-100/20 to-transparent -z-10 animate-pulse" />
          
          {/* Enhanced Header with Floating Elements */}
          <DialogHeader className="flex-shrink-0 px-8 pt-8 pb-6 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-mint-500/5 via-blue-500/5 to-purple-500/5 -z-10 animate-fade-in" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-mint-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse" />
            
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-mint-600 rounded-2xl flex items-center justify-center shadow-xl shadow-mint-500/25 animate-bounce">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-mint-700 to-gray-700 bg-clip-text text-transparent animate-fade-in">
                  Import Content
                </DialogTitle>
                <div className="h-1.5 w-32 bg-gradient-to-r from-mint-500 via-blue-500 to-purple-500 rounded-full mt-3 animate-fade-in shadow-lg" />
                <DialogDescription className="text-gray-600 text-lg leading-relaxed mt-4 animate-fade-in">
                  Transform documents, videos, and online content into structured notes with our advanced import system
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Enhanced Tabs with Sliding Indicator */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col px-8">
            <div className="relative mb-8">
              <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-3 shadow-xl relative overflow-hidden">
                {/* Animated Tab Indicator */}
                <div 
                  className="absolute top-3 bottom-3 bg-gradient-to-r from-mint-500 to-mint-600 rounded-xl shadow-lg transition-all duration-500 ease-out"
                  style={{
                    width: 'calc(20% - 6px)',
                    left: `calc(${3 + (tabs.findIndex(tab => tab.value === activeTab) * 20)}% + 3px)`,
                  }}
                />
                
                {tabs.map((tab, index) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value}
                    className="relative z-10 font-semibold text-gray-700 data-[state=active]:text-white data-[state=active]:shadow-none transition-all duration-300 hover:scale-105 hover:text-mint-600 rounded-lg py-3"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content Area with Enhanced Scroll */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pr-3 custom-scrollbar">
                <TabsContent value="file" className="h-full animate-fade-in">
                  <FileImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
                </TabsContent>

                <TabsContent value="youtube" className="h-full animate-fade-in">
                  <YouTubeImportTab onImport={handleImport} />
                </TabsContent>

                <TabsContent value="api" className="h-full animate-fade-in">
                  <ApiImportTab onSaveNote={onSaveNote} isPremiumUser={isPremiumUser} />
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
        </DialogContent>
      </Dialog>

      {/* Enhanced Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.05);
          border-radius: 8px;
          margin: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: scale(1.1);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </>
  );
};
