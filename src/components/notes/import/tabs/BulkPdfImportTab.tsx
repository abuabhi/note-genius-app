
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Trash2, Upload, CheckCircle, AlertCircle, Loader2, Clock, X, RotateCcw } from 'lucide-react';
import { SubjectSelector } from '../components/SubjectSelector';
import { processSelectedDocument } from '../importUtils';
import { useRequestDebounce } from '@/hooks/performance/useRequestDebounce';
import { useBackgroundProcessor } from '@/hooks/performance/useBackgroundProcessor';
import { toast } from '@/hooks/use-toast';

interface BulkPdfImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error' | 'warning' | 'timeout' | 'cancelled';
  subject: string;
  error?: string;
  startTime?: number;
  elapsedTime?: number;
  progress?: number;
  abortController?: AbortController;
  retryCount?: number;
}

export const BulkPdfImportTab = ({ onSaveNote }: BulkPdfImportTabProps) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [concurrentProcessing, setConcurrentProcessing] = useState(2);
  const timerRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  
  const { debouncedCallback: debouncedProcessFile } = useRequestDebounce(processSelectedDocument, 1000);
  const { addJob, registerWorker } = useBackgroundProcessor();

  const TIMEOUT_WARNING = 60000; // 1 minute
  const TIMEOUT_LIMIT = 180000; // 3 minutes
  const MAX_RETRIES = 2;

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

  const updateFileStatus = useCallback((index: number, status: FileStatus['status'], error?: string, additional?: Partial<FileStatus>) => {
    setFileStatuses(prev => prev.map((item, i) => 
      i === index ? { 
        ...item, 
        status, 
        error,
        elapsedTime: item.startTime ? Date.now() - item.startTime : 0,
        ...additional 
      } : item
    ));
  }, []);

  const startTimer = (index: number) => {
    const startTime = Date.now();
    updateFileStatus(index, 'processing', undefined, { startTime, abortController: new AbortController() });
    
    // Warning timer
    const warningTimer = setTimeout(() => {
      updateFileStatus(index, 'warning', 'Taking longer than expected...');
      toast({
        title: "Processing taking longer than expected",
        description: `File "${fileStatuses[index]?.file.name}" is still processing...`,
        variant: "default"
      });
    }, TIMEOUT_WARNING);
    
    // Timeout timer
    const timeoutTimer = setTimeout(() => {
      const controller = fileStatuses[index]?.abortController;
      if (controller) {
        controller.abort();
      }
      updateFileStatus(index, 'timeout', 'Processing timed out after 3 minutes');
      clearTimer(index);
      setProcessingCount(prev => prev - 1);
    }, TIMEOUT_LIMIT);
    
    timerRef.current.set(index, warningTimer);
    timerRef.current.set(index + 10000, timeoutTimer); // Offset to avoid collision
  };

  const clearTimer = (index: number) => {
    const warningTimer = timerRef.current.get(index);
    const timeoutTimer = timerRef.current.get(index + 10000);
    if (warningTimer) clearTimeout(warningTimer);
    if (timeoutTimer) clearTimeout(timeoutTimer);
    timerRef.current.delete(index);
    timerRef.current.delete(index + 10000);
  };

  const cancelFile = (index: number) => {
    const fileStatus = fileStatuses[index];
    if (fileStatus?.abortController) {
      fileStatus.abortController.abort();
    }
    updateFileStatus(index, 'cancelled', 'Processing cancelled by user');
    clearTimer(index);
    setProcessingCount(prev => prev - 1);
  };

  const retryFile = async (index: number) => {
    const fileStatus = fileStatuses[index];
    if (!fileStatus || (fileStatus.retryCount || 0) >= MAX_RETRIES) {
      toast({
        title: "Maximum retries reached",
        description: "This file has reached the maximum number of retry attempts.",
        variant: "destructive"
      });
      return;
    }
    
    await processFile(index, (fileStatus.retryCount || 0) + 1);
  };

  const updateFileSubject = (index: number, subject: string) => {
    setFileStatuses(prev => prev.map((item, i) => 
      i === index ? { ...item, subject } : item
    ));
  };

  const processFile = async (index: number, retryCount = 0) => {
    const fileStatus = fileStatuses[index];
    if (!fileStatus) return;

    startTimer(index);
    setProcessingCount(prev => prev + 1);
    
    try {
      const controller = new AbortController();
      updateFileStatus(index, 'processing', undefined, { 
        retryCount,
        abortController: controller,
        progress: 0 
      });

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout')), TIMEOUT_LIMIT);
      });

      // Create processing promise with progress simulation
      const processingPromise = (async () => {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFileStatuses(prev => prev.map((item, i) => 
            i === index && item.status === 'processing' 
              ? { ...item, progress: Math.min((item.progress || 0) + Math.random() * 15, 85) }
              : item
          ));
        }, 2000);

        try {
          const result = await processSelectedDocument(
            fileStatus.file, 
            fileStatus.file.name.split('.').pop()?.toLowerCase() || 'pdf'
          );
          
          clearInterval(progressInterval);
          updateFileStatus(index, 'processing', undefined, { progress: 100 });
          
          const note = {
            title: result.title || fileStatus.file.name.replace('.pdf', ''),
            content: result.text,
            date: new Date().toISOString(),
            subject: fileStatus.subject,
            description: `Bulk imported PDF: ${fileStatus.file.name}`,
            sourceType: "import"
          };
          
          const success = await onSaveNote(note);
          if (success) {
            updateFileStatus(index, 'success');
            clearTimer(index);
          } else {
            throw new Error('Failed to save note');
          }
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      })();

      // Race between processing and timeout
      await Promise.race([processingPromise, timeoutPromise]);
    } catch (error) {
      console.error(`Error processing PDF ${fileStatus.file.name}:`, error);
      
      if (error instanceof Error) {
        if (error.message === 'Processing timeout') {
          updateFileStatus(index, 'timeout', 'Processing timed out after 3 minutes');
        } else if (error.name === 'AbortError') {
          updateFileStatus(index, 'cancelled', 'Processing was cancelled');
        } else {
          const errorMessage = error.message || 'Unknown error occurred';
          updateFileStatus(index, 'error', errorMessage);
        }
      } else {
        updateFileStatus(index, 'error', 'Unknown error occurred');
      }
      
      clearTimer(index);
    } finally {
      setProcessingCount(prev => prev - 1);
    }
  };

  const processFiles = async () => {
    setIsProcessing(true);
    
    try {
      const pendingFiles = fileStatuses
        .map((_, index) => index)
        .filter(index => ['pending', 'error', 'timeout', 'cancelled'].includes(fileStatuses[index].status));
      
      // Process files in batches based on concurrent processing limit
      const processBatch = async (batch: number[]) => {
        await Promise.allSettled(batch.map(index => processFile(index)));
      };
      
      // Split into batches
      for (let i = 0; i < pendingFiles.length; i += concurrentProcessing) {
        const batch = pendingFiles.slice(i, i + concurrentProcessing);
        await processBatch(batch);
      }
      
      // Show completion summary
      const completed = fileStatuses.filter(f => f.status === 'success').length;
      const failed = fileStatuses.filter(f => ['error', 'timeout', 'cancelled'].includes(f.status)).length;
      
      toast({
        title: "Bulk processing completed",
        description: `${completed} files processed successfully, ${failed} failed.`,
        variant: completed > 0 ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error("Error processing PDFs:", error);
      toast({
        title: "Processing failed",
        description: "An error occurred during bulk processing.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingCount(0);
    }
  };

  const clearSuccessfulFiles = () => {
    setFileStatuses(prev => prev.filter(item => item.status !== 'success'));
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-3 w-3 text-primary animate-spin" />;
      case 'warning':
        return <Clock className="h-3 w-3 text-warning animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'timeout':
        return <Clock className="h-3 w-3 text-destructive" />;
      case 'cancelled':
        return <X className="h-3 w-3 text-muted-foreground" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-muted" />;
    }
  };

  const getStatusText = (fileStatus: FileStatus) => {
    const elapsed = fileStatus.elapsedTime ? Math.floor(fileStatus.elapsedTime / 1000) : 0;
    
    switch (fileStatus.status) {
      case 'processing':
        return (
          <div className="text-xs space-y-1">
            <div className="text-primary font-medium">Processing ({elapsed}s)</div>
            {fileStatus.progress !== undefined && (
              <Progress value={fileStatus.progress} className="h-1" />
            )}
          </div>
        );
      case 'warning':
        return <span className="text-xs text-warning font-medium">Slow ({elapsed}s)</span>;
      case 'success':
        return <span className="text-xs text-success font-medium">Completed</span>;
      case 'timeout':
        return <span className="text-xs text-destructive font-medium">Timeout</span>;
      case 'cancelled':
        return <span className="text-xs text-muted-foreground font-medium">Cancelled</span>;
      case 'error':
        return <span className="text-xs text-destructive font-medium">Failed</span>;
      default:
        return <span className="text-xs text-muted-foreground">Ready</span>;
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
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Selected Files ({fileStatuses.length})
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure subjects for each PDF before processing
                {processingCount > 0 && ` • Processing ${processingCount} files`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={clearSuccessfulFiles}
                variant="outline"
                size="sm"
                disabled={!fileStatuses.some(f => f.status === 'success')}
              >
                Clear Completed
              </Button>
              <Button
                onClick={() => setFileStatuses([])}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            {fileStatuses.map((fileStatus, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                {/* File Icon & Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FileText className="h-4 w-4 text-red-500" />
                  {getStatusIcon(fileStatus.status)}
                </div>

                {/* File Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {fileStatus.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(fileStatus.file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  {fileStatus.status === 'error' && fileStatus.error && (
                    <p className="text-xs text-destructive mt-1">{fileStatus.error}</p>
                  )}
                </div>

                {/* Subject Selector */}
                <div className="w-48">
                  <div className="space-y-0">
                    <SubjectSelector
                      value={fileStatus.subject}
                      onValueChange={(subject) => updateFileSubject(index, subject)}
                      required
                      className="w-full [&>div]:space-y-0 [&_label]:hidden"
                    />
                  </div>
                </div>

                {/* Status Text & Actions */}
                <div className="w-32 text-right space-y-1">
                  {getStatusText(fileStatus)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 flex-shrink-0">
                  {fileStatus.status === 'processing' && (
                    <Button
                      onClick={() => cancelFile(index)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {(['error', 'timeout', 'cancelled'].includes(fileStatus.status)) && (
                    <Button
                      onClick={() => retryFile(index)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary text-muted-foreground"
                      disabled={(fileStatus.retryCount || 0) >= MAX_RETRIES}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    disabled={fileStatus.status === 'processing'}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Process Controls */}
          <div className="space-y-4 pt-4">
            {/* Concurrent Processing Setting */}
            <div className="flex items-center justify-center gap-4 p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Concurrent processing:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(num => (
                  <Button
                    key={num}
                    onClick={() => setConcurrentProcessing(num)}
                    variant={concurrentProcessing === num ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    disabled={isProcessing}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Process Button */}
            <div className="flex justify-center">
              <Button
                onClick={processFiles}
                disabled={isProcessing || fileStatuses.some(f => !f.subject.trim())}
                className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing {processingCount} of {fileStatuses.length} PDFs...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Process {fileStatuses.filter(f => ['pending', 'error', 'timeout', 'cancelled'].includes(f.status)).length} PDF{fileStatuses.length > 1 ? 's' : ''}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
