
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, FileIcon } from 'lucide-react';
import { useImportState } from '../useImportState';
import { FileDropZone } from './components/FileDropZone';
import { ProcessedContent } from './components/ProcessedContent';
import { ProcessingStatus } from './components/ProcessingStatus';

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

  const supportedFormats = [
    { icon: FileText, name: 'PDF Documents', ext: '.pdf' },
    { icon: FileText, name: 'Word Documents', ext: '.docx' },
    { icon: FileText, name: 'Text Files', ext: '.txt' },
    { icon: Image, name: 'Images', ext: '.jpg, .png' },
    { icon: FileIcon, name: 'Other Documents', ext: '.rtf, .odt' }
  ];

  return (
    <div className="space-y-4 h-full">
      {!selectedFile && !processedText && (
        <Card className="border-2 border-dashed border-mint-200 bg-mint-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-mint-600" />
            </div>
            <CardTitle className="text-mint-800">Upload Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropZone onFileSelected={handleFileSelected} />
            
            <div className="bg-white rounded-lg p-4 border border-mint-200">
              <h4 className="font-medium text-mint-800 mb-3">Supported Formats:</h4>
              <div className="grid grid-cols-1 gap-2">
                {supportedFormats.map((format, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-mint-600">
                    <format.icon className="h-4 w-4" />
                    <span className="font-medium">{format.name}</span>
                    <span className="text-mint-500">({format.ext})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFile && !processedText && (
        <Card className="border border-mint-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-mint-800">Selected File</h3>
                <Button variant="outline" onClick={clearFiles} size="sm">
                  Clear
                </Button>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-mint-50 rounded border border-mint-200">
                <FileText className="h-4 w-4 text-mint-600" />
                <span className="text-sm text-mint-800">{selectedFile.name}</span>
                <span className="text-xs text-mint-500 ml-auto">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="w-full bg-mint-500 hover:bg-mint-600 text-white"
              >
                {isProcessing ? 'Processing...' : 'Process File'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="border border-mint-200">
          <CardContent className="p-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-mint-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium text-mint-800">Processing Document</h3>
                <p className="text-sm text-mint-600">Please wait while we extract the content...</p>
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
