
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SubjectSelector } from '../components/SubjectSelector';
import { processSelectedDocument } from '../importUtils';

interface BulkPdfImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export const BulkPdfImportTab = ({ onSaveNote }: BulkPdfImportTabProps) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("PDF Imports");

  const handleFilesSelected = (files: FileList | null) => {
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      const newFileStatuses = pdfFiles.map(file => ({ file, status: 'pending' as const }));
      setFileStatuses(prev => [...prev, ...newFileStatuses]);
    }
  };

  const removeFile = (index: number) => {
    setFileStatuses(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileStatus = (index: number, status: FileStatus['status'], error?: string) => {
    setFileStatuses(prev => prev.map((item, i) => 
      i === index ? { ...item, status, error } : item
    ));
  };

  const processFiles = async () => {
    setIsProcessing(true);
    
    try {
      for (let i = 0; i < fileStatuses.length; i++) {
        const fileStatus = fileStatuses[i];
        updateFileStatus(i, 'processing');
        
        try {
          const result = await processSelectedDocument(fileStatus.file, 'application/pdf');
          
          const note = {
            title: result.title || fileStatus.file.name.replace('.pdf', ''),
            content: result.text,
            date: new Date().toISOString(),
            subject: selectedSubject,
            description: `Bulk imported PDF: ${fileStatus.file.name}`,
            sourceType: "import"
          };
          
          await onSaveNote(note);
          updateFileStatus(i, 'success');
        } catch (error) {
          console.error(`Error processing PDF ${fileStatus.file.name}:`, error);
          updateFileStatus(i, 'error', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      // Clear successfully processed files
      setFileStatuses(prev => prev.filter(item => item.status === 'error'));
    } catch (error) {
      console.error("Error processing PDFs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {fileStatuses.length === 0 ? (
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
            <h3 className="text-sm font-medium text-gray-900">Selected Files ({fileStatuses.length})</h3>
            <Button
              onClick={() => setFileStatuses([])}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <SubjectSelector
            value={selectedSubject}
            onValueChange={setSelectedSubject}
            required
          />
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {fileStatuses.map((fileStatus, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="p-1.5 bg-red-50 rounded-md">
                  {getStatusIcon(fileStatus.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileStatus.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(fileStatus.file.size / 1024 / 1024).toFixed(1)} MB
                    {fileStatus.status === 'processing' && ' - Processing...'}
                    {fileStatus.status === 'success' && ' - Completed'}
                    {fileStatus.status === 'error' && fileStatus.error && ` - Error: ${fileStatus.error}`}
                  </p>
                </div>
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  disabled={fileStatus.status === 'processing'}
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
              `Process ${fileStatuses.length} PDF${fileStatuses.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
