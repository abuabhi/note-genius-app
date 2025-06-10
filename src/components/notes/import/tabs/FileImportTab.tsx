
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Sparkles } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {!selectedFile && !processedText && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-scale-in group">
          <CardHeader className="text-center pb-6 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-mint-500 to-mint-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse group-hover:animate-bounce">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Upload Files
              </CardTitle>
              <div className="h-1 w-20 bg-gradient-to-r from-mint-500 to-mint-300 rounded-full mx-auto mt-3 animate-fade-in" />
              <p className="text-gray-600 text-base mt-4 leading-relaxed">
                Upload documents, PDFs, or text files to import as notes
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <FileDropZone onFileSelected={handleFileSelected} />
          </CardContent>
        </Card>
      )}

      {selectedFile && !processedText && (
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-mint-500" />
                  Selected File
                </h3>
                <Button 
                  variant="outline" 
                  onClick={clearFiles} 
                  size="sm"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Clear
                </Button>
              </div>
              
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-mint-50/30 rounded-xl border border-gray-200/50 shadow-inner animate-fade-in">
                <div className="p-3 bg-white rounded-lg shadow-md">
                  <FileText className="h-6 w-6 text-mint-600" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-800">{selectedFile.name}</span>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={processDocument} 
                disabled={isProcessing}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-mint-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Upload className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Processing Document</h3>
                <p className="text-gray-600 mt-2">Please wait while we extract the content...</p>
                
                {/* Animated Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-mint-500 to-mint-600 rounded-full animate-pulse" style={{width: '60%'}} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {processedText && (
        <div className="animate-fade-in">
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
        </div>
      )}
    </div>
  );
};
