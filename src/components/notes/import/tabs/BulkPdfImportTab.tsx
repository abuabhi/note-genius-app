
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
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            <FileStack className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle className="text-gray-800 text-lg font-semibold">Bulk PDF Import</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Upload multiple PDF files and convert them to notes simultaneously
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {selectedFiles.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-700 mb-3 font-medium">Drop PDF files here or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Select multiple PDF files to process them all at once</p>
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
                className="inline-block px-4 py-2 bg-mint-500 text-white rounded-lg cursor-pointer hover:bg-mint-600 transition-colors font-medium"
              >
                Select PDFs
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Selected Files ({selectedFiles.length})</h3>
                <Button
                  onClick={() => setSelectedFiles([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{file.name}</span>
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
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={processFiles}
                disabled={isProcessing}
                className="w-full"
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
