
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Upload } from 'lucide-react';

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
    <div className="space-y-4">
      {selectedFiles.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-mint-400 transition-colors bg-gray-50">
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Drop PDF files here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Select multiple PDF files to process them all at once</p>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-mint-500 text-white rounded-lg cursor-pointer hover:bg-mint-600 transition-colors text-sm font-medium"
            >
              Select PDFs
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Selected Files ({selectedFiles.length})</h3>
            <Button
              onClick={() => setSelectedFiles([])}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="p-1.5 bg-red-50 rounded-md">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            onClick={processFiles}
            disabled={isProcessing}
            className="w-full bg-mint-500 hover:bg-mint-600 text-white"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing PDFs...
              </div>
            ) : (
              `Process ${selectedFiles.length} PDF${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
