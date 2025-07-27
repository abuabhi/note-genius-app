
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
  subject: string;
  error?: string;
}

export const BulkPdfImportTab = ({ onSaveNote }: BulkPdfImportTabProps) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (files: FileList | null) => {
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      const newFileStatuses = pdfFiles.map(file => ({ 
        file, 
        status: 'pending' as const,
        subject: "PDF Imports"
      }));
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

  const updateFileSubject = (index: number, subject: string) => {
    setFileStatuses(prev => prev.map((item, i) => 
      i === index ? { ...item, subject } : item
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
            subject: fileStatus.subject,
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
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {fileStatuses.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-mint-400 transition-colors bg-gradient-to-br from-gray-50 to-white">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-xl flex items-center justify-center shadow-sm">
              <Upload className="h-8 w-8 text-mint-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Multiple PDFs</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Select multiple PDF files to process them all at once. Each file can be assigned to a different subject.
              </p>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-mint-500 text-white rounded-lg cursor-pointer hover:bg-mint-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Upload className="h-4 w-4" />
              Select PDF Files
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-mint-50 to-mint-100 rounded-lg border border-mint-200">
            <div>
              <h3 className="text-lg font-semibold text-mint-800">
                Selected Files ({fileStatuses.length})
              </h3>
              <p className="text-sm text-mint-600 mt-1">
                Configure subjects for each PDF before processing
              </p>
            </div>
            <Button
              onClick={() => setFileStatuses([])}
              variant="outline"
              size="sm"
              className="border-mint-300 text-mint-700 hover:bg-mint-50"
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-3">
            {fileStatuses.map((fileStatus, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* File Icon & Status */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                          <FileText className="h-6 w-6 text-red-600" />
                        </div>
                        {/* Status indicator */}
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center">
                          {getStatusIcon(fileStatus.status)}
                        </div>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {fileStatus.file.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {(fileStatus.file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          {fileStatus.status === 'processing' && (
                            <span className="text-xs text-blue-600 font-medium">Processing...</span>
                          )}
                          {fileStatus.status === 'success' && (
                            <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                          )}
                          {fileStatus.status === 'error' && (
                            <span className="text-xs text-red-600 font-medium">
                              Error: {fileStatus.error}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subject Selector */}
                      <div className="space-y-1">
                        <SubjectSelector
                          value={fileStatus.subject}
                          onValueChange={(subject) => updateFileSubject(index, subject)}
                          required
                          className="max-w-xs"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 text-gray-400"
                        disabled={fileStatus.status === 'processing'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Process Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={processFiles}
              disabled={isProcessing || fileStatuses.some(f => !f.subject.trim())}
              className="w-full max-w-md bg-mint-500 hover:bg-mint-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing {fileStatuses.filter(f => f.status === 'processing').length} of {fileStatuses.length} PDFs...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Process {fileStatuses.length} PDF{fileStatuses.length > 1 ? 's' : ''}
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
