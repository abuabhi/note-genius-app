
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
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
    <div className="space-y-6">
      {!selectedFile && !processedText && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle className="text-gray-800 text-lg font-semibold">Upload Files</CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Upload documents, PDFs, or text files to import as notes
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <FileDropZone onFileSelected={handleFileSelected} />
          </CardContent>
        </Card>
      )}

      {selectedFile && !processedText && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Selected File</h3>
                <Button variant="outline" onClick={clearFiles} size="sm">
                  Clear
                </Button>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800">{selectedFile.name}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Process File'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-gray-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Processing Document</h3>
                <p className="text-sm text-gray-600 mt-1">Please wait while we extract the content...</p>
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
              category: "Imports",
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
