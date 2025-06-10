
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileStack, Upload, FileText, Trash2, Sparkles } from 'lucide-react';

interface BulkPdfImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
}

export const BulkPdfImportTab = ({ onSaveNote }: BulkPdfImportTabProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (files: FileList | null) => {
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    setIsProcessing(true);
    
    try {
      for (const file of selectedFiles) {
        const note = {
          title: file.name.replace('.pdf', ''),
          content: `Content extracted from ${file.name}`,
          date: new Date().toISOString(),
          category: "PDF Imports",
          description: `Bulk imported PDF: ${file.name}`,
          sourceType: "import"
        };
        await onSaveNote(note);
      }
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error processing PDFs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] animate-scale-in group">
        <CardHeader className="text-center pb-6 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-mint-500 to-mint-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse group-hover:animate-bounce">
              <FileStack className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Bulk PDF Import
            </CardTitle>
            <div className="h-1 w-24 bg-gradient-to-r from-mint-500 to-mint-300 rounded-full mx-auto mt-3 animate-fade-in" />
            <p className="text-gray-600 text-base mt-4 leading-relaxed">
              Upload multiple PDF files and convert them to notes simultaneously
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-8">
          {selectedFiles.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-mint-400 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-mint-50/20 hover:from-mint-50/50 hover:to-mint-100/30 group cursor-pointer">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 group-hover:from-mint-500 group-hover:to-mint-600 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-700 mb-2">Drop PDF files here or click to browse</p>
                  <p className="text-gray-500 mb-6">Select multiple PDF files to process them all at once</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                  id="bulk-pdf-input"
                />
                <label
                  htmlFor="bulk-pdf-input"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-xl cursor-pointer hover:from-mint-600 hover:to-mint-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FileStack className="h-5 w-5" />
                  Select PDFs
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-mint-500" />
                  <h3 className="text-xl font-bold text-gray-800">Selected Files ({selectedFiles.length})</h3>
                </div>
                <Button
                  onClick={() => setSelectedFiles([])}
                  variant="outline"
                  size="sm"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-3 bg-gradient-to-br from-gray-50 to-mint-50/30 rounded-xl p-6 shadow-inner custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{file.name}</span>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={processFiles}
                disabled={isProcessing}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing PDFs...
                  </div>
                ) : (
                  `Process ${selectedFiles.length} PDF${selectedFiles.length > 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
