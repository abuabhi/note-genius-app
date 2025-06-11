import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import { useImportState } from '../useImportState';
import { FileDropZone } from './components/FileDropZone';
import { ProcessedContent } from './components/ProcessedContent';

interface FileImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const FileImportTab = ({ onSaveNote }: FileImportTabProps) => {
  const {
    selectedFile,
    processedText,
    documentTitle,
    isProcessing,
    handleFileSelected,
    processDocument,
    setSelectedFile,
    setProcessedText
  } = useImportState(onSaveNote);

  const clearFiles = () => {
    setSelectedFile(null);
    setProcessedText(null);
  };

  return (
    <div className="space-y-4">
      {!selectedFile && !processedText && (
        <FileDropZone onFileSelected={handleFileSelected} />
      )}

      {selectedFile && !processedText && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mint-500" />
                  Selected File
                </h3>
                <Button 
                  variant="outline" 
                  onClick={clearFiles} 
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Clear
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <div className="p-2 bg-mint-50 rounded-md">
                  <FileText className="h-4 w-4 text-mint-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="w-full bg-mint-500 hover:bg-mint-600 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Process File'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-mint-500 rounded-lg flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Processing Document</h3>
                <p className="text-xs text-gray-600">Extracting content...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {processedText && (
        <ProcessedContent 
          title={documentTitle}
          content={processedText}
          onSave={async () => {
            const note = {
              title: documentTitle,
              content: processedText,
              date: new Date().toISOString(),
              subject: "Imports", // Changed from category to subject
              description: `Imported from file`,
              sourceType: "import"
            };
            const success = await onSaveNote(note);
            if (success) {
              clearFiles();
            }
          }}
          onBack={clearFiles}
        />
      )}
    </div>
  );
};
