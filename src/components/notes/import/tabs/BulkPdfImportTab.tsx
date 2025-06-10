
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileStack, Upload, FileText, Trash2 } from 'lucide-react';

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
        // Simulate processing - in real app, this would extract text from PDF
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
      <Card className="border border-mint-200 bg-mint-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-2">
            <FileStack className="h-6 w-6 text-mint-600" />
          </div>
          <CardTitle className="text-mint-800 text-lg">Bulk PDF Import</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {selectedFiles.length === 0 ? (
            <div className="border-2 border-dashed border-mint-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-mint-400" />
              <p className="text-mint-700 mb-2">Drop PDF files here or click to browse</p>
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
                className="inline-block px-4 py-2 bg-mint-500 text-white rounded cursor-pointer hover:bg-mint-600"
              >
                Select PDFs
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-mint-800">Selected Files ({selectedFiles.length})</h3>
                <Button
                  onClick={() => setSelectedFiles([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-mint-200">
                    <FileText className="h-4 w-4 text-mint-600" />
                    <span className="text-sm text-mint-800 flex-1">{file.name}</span>
                    <span className="text-xs text-mint-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <Button
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={processFiles}
                disabled={isProcessing}
                className="w-full bg-mint-500 hover:bg-mint-600 text-white"
              >
                {isProcessing ? 'Processing PDFs...' : `Process ${selectedFiles.length} PDF${selectedFiles.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
