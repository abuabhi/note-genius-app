
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImportTab } from './tabs/FileImportTab';
import { ApiImportTab } from './tabs/ApiImportTab';
import { ScanImportTab } from './tabs/ScanImportTab';
import { YouTubeImportTab } from './tabs/YouTubeImportTab';
import { BulkPdfImportTab } from './tabs/BulkPdfImportTab';
import { Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Debug logging for dialog state changes
  useEffect(() => {
    console.log('🔍 [IMPORT DIALOG] Dialog visibility changed:', { isVisible, activeTab, isProcessing, isAuthenticating });
  }, [isVisible, activeTab, isProcessing, isAuthenticating]);

  // Enhanced authentication event listeners - simplified
  useEffect(() => {
    const handleAuthStart = () => {
      console.log('🔍 [IMPORT DIALOG] OAuth authentication started');
      setIsAuthenticating(true);
    };

    const handleAuthEnd = (event: any) => {
      console.log('🔍 [IMPORT DIALOG] OAuth authentication ended', event.detail);
      setIsAuthenticating(false);
      
      // Don't auto-close dialog on successful auth - let user continue importing
      if (event.detail?.success) {
        console.log('🔍 [IMPORT DIALOG] Auth successful, keeping dialog open for document selection');
      }
    };

    // Listen for custom OAuth events
    window.addEventListener('googledocs:auth:start', handleAuthStart);
    window.addEventListener('googledocs:auth:end', handleAuthEnd);

    return () => {
      window.removeEventListener('googledocs:auth:start', handleAuthStart);
      window.removeEventListener('googledocs:auth:end', handleAuthEnd);
    };
  }, []);

  const handleImport = async (noteData: any): Promise<boolean> => {
    if (isProcessing) return false;
    
    console.log('📝 [IMPORT DIALOG] Starting import process for:', { 
      source: noteData?.source || 'unknown',
      hasTitle: !!noteData?.title,
      hasContent: !!noteData?.content,
      activeTab
    });
    
    setIsProcessing(true);
    
    try {
      const success = await onSaveNote(noteData);
      
      // Only close dialog for single-file imports, keep open for service imports (like Google Docs)
      const shouldCloseDialog = !['googledocs', 'notion', 'evernote'].includes(noteData?.source);
      
      console.log('📝 [IMPORT DIALOG] Import result:', { 
        success, 
        shouldCloseDialog,
        source: noteData?.source,
        activeTab
      });
      
      if (success && shouldCloseDialog) {
        console.log('📝 [IMPORT DIALOG] Closing dialog after successful single-file import');
        onClose();
      } else if (success && !shouldCloseDialog) {
        console.log('📝 [IMPORT DIALOG] Keeping dialog open for service import');
      }
      
      return success;
    } catch (error) {
      console.error('❌ [IMPORT DIALOG] Import failed:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs: Array<{ value: string; label: string; badge?: string; badgeAriaLabel?: string }> = [
    { value: 'file', label: 'Files' },
    { value: 'youtube', label: 'YouTube', badge: 'Beta', badgeAriaLabel: 'Feature in beta' },
    { value: 'api', label: 'Online' },
    { value: 'scan', label: 'Scan' },
    { value: 'bulk', label: 'Bulk PDF' }
  ];

  return (
    <>
      <Dialog open={isVisible} onOpenChange={(open) => {
        // Prevent dialog from closing during import processing or OAuth authentication
        if (!open && !isProcessing && !isAuthenticating) {
          console.log('📝 [IMPORT DIALOG] Dialog close requested, processing:', isProcessing, 'authenticating:', isAuthenticating);
          onClose();
        } else if (!open && (isProcessing || isAuthenticating)) {
          console.log('⚠️ [IMPORT DIALOG] Prevented close during processing or authentication', { isProcessing, isAuthenticating });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
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
                    <span className="inline-flex items-center gap-2">
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <Badge
                          variant="secondary"
                          aria-label={tab.badgeAriaLabel || 'Beta badge'}
                          className="text-[10px]"
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </span>
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
                  <ApiImportTab 
                    onSaveNote={handleImport} 
                    isPremiumUser={isPremiumUser}
                    onAuthStart={() => setIsAuthenticating(true)}
                    onAuthEnd={() => setIsAuthenticating(false)}
                  />
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
