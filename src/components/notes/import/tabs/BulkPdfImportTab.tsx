import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Merge, Split, Trash2, Eye, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedContent } from "./components/ProcessedContent";

interface BulkPdfImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

interface PdfFile {
  file: File;
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedText?: string;
  suggestedTitle?: string;
  suggestedSubject?: string;
  processingMethod?: string;
  isAiGenerated?: boolean;
  analysisConfidence?: number;
  error?: string;
}

export const BulkPdfImportTab = ({ onSaveNote, isPremiumUser }: BulkPdfImportTabProps) => {
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [mergeOption, setMergeOption] = useState<'merge' | 'separate'>('separate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingFile, setProcessingFile] = useState<string>('');
  const [processedFiles, setProcessedFiles] = useState<PdfFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'select' | 'process' | 'review'>('select');

  const handleFileSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      toast.warning("Only PDF files are supported for bulk import");
    }

    if (pdfFiles.length > 10) {
      toast.error("Maximum 10 files can be processed at once");
      return;
    }

    const newPdfFiles: PdfFile[] = pdfFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      status: 'pending'
    }));

    setSelectedFiles(newPdfFiles);
  }, []);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const processPdfFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select PDF files to import");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('process');

    try {
      const results: PdfFile[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const pdfFile = selectedFiles[i];
        setProcessingFile(pdfFile.name);
        setProgress((i / selectedFiles.length) * 100);

        // Update file status to processing
        setSelectedFiles(prev => prev.map(f => 
          f.id === pdfFile.id ? { ...f, status: 'processing' } : f
        ));

        try {
          console.log(`🔄 Processing PDF: ${pdfFile.name}`);

          // Upload file to Supabase storage
          const fileUrl = await uploadFileToStorage(pdfFile.file);
          
          // Get current user session for content analysis
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;

          // Call the process-document edge function
          const { data: processResult, error: processError } = await supabase.functions.invoke('process-document', {
            body: {
              fileUrl,
              fileType: 'pdf',
              userId: userId
            }
          });

          if (processError) {
            throw new Error(processError.message || 'Failed to process PDF');
          }

          if (!processResult || !processResult.success) {
            throw new Error(processResult?.error || 'Failed to process PDF');
          }

          const processedFile: PdfFile = {
            ...pdfFile,
            status: 'completed',
            processedText: processResult.text,
            suggestedTitle: processResult.title || pdfFile.name.replace('.pdf', ''),
            suggestedSubject: processResult.subject || 'Uncategorized',
            processingMethod: processResult.metadata?.processingMethod || 'unknown',
            isAiGenerated: processResult.metadata?.contentAnalysis?.aiGeneratedTitle || false,
            analysisConfidence: processResult.metadata?.contentAnalysis?.confidence || 0
          };

          results.push(processedFile);
          
          // Update file status to completed
          setSelectedFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? processedFile : f
          ));

          console.log(`✅ Successfully processed: ${pdfFile.name}`);
          
        } catch (error) {
          console.error(`❌ Error processing ${pdfFile.name}:`, error);
          
          const failedFile: PdfFile = {
            ...pdfFile,
            status: 'failed',
            error: error.message || 'Processing failed'
          };
          
          results.push(failedFile);
          
          // Update file status to failed
          setSelectedFiles(prev => prev.map(f => 
            f.id === pdfFile.id ? failedFile : f
          ));
          
          toast.error(`Failed to process ${pdfFile.name}: ${error.message}`);
        }
      }

      setProgress(100);
      setProcessedFiles(results);
      setCurrentStep('review');

      const successCount = results.filter(f => f.status === 'completed').length;
      const failedCount = results.filter(f => f.status === 'failed').length;
      
      if (successCount > 0) {
        toast.success(`Successfully processed ${successCount} PDF${successCount > 1 ? 's' : ''}`);
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to process ${failedCount} PDF${failedCount > 1 ? 's' : ''}`);
      }

    } catch (error) {
      console.error('Error in bulk PDF processing:', error);
      toast.error("Failed to process PDF files");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessingFile('');
    }
  };

  const saveProcessedFiles = async () => {
    const completedFiles = processedFiles.filter(f => f.status === 'completed');
    
    if (completedFiles.length === 0) {
      toast.error("No successfully processed files to save");
      return;
    }

    try {
      if (mergeOption === 'merge') {
        // Merge all texts into one note
        const mergedText = completedFiles.map(file => 
          `# ${file.suggestedTitle}\n\n${file.processedText}`
        ).join('\n\n---\n\n');
        
        const mergedNote: Omit<Note, 'id'> = {
          title: `Merged PDFs (${completedFiles.length} files)`,
          content: mergedText,
          description: `Combined content from ${completedFiles.length} PDF files`,
          tags: [
            { name: 'PDF Import', color: '#8B5CF6' }, 
            { name: 'Bulk Import', color: '#6366F1' },
            { name: 'AI Generated', color: '#10B981' }
          ],
          sourceType: 'import',
          pinned: false,
          archived: false,
          date: new Date().toISOString().split('T')[0],
          category: 'Documents' // Use Documents for merged content since it contains multiple subjects
        };

        await onSaveNote(mergedNote);
        toast.success("PDFs merged and saved as one note");
      } else {
        // Create separate notes - FIXED: Use AI-generated subject as category
        for (const file of completedFiles) {
          const note: Omit<Note, 'id'> = {
            title: file.suggestedTitle || file.name.replace('.pdf', ''),
            content: file.processedText || '',
            description: `Imported from ${file.name}`,
            tags: [
              { name: 'PDF Import', color: '#8B5CF6' },
              ...(file.isAiGenerated ? [{ name: 'AI Generated', color: '#10B981' }] : [])
            ],
            sourceType: 'import',
            pinned: false,
            archived: false,
            date: new Date().toISOString().split('T')[0],
            category: file.suggestedSubject || 'Uncategorized' // FIXED: Use AI-generated subject instead of hardcoded "Documents"
          };

          await onSaveNote(note);
        }
        toast.success(`Created ${completedFiles.length} separate notes from PDFs`);
      }

      // Reset state after successful save
      setSelectedFiles([]);
      setProcessedFiles([]);
      setCurrentStep('select');
      
    } catch (error) {
      console.error('Error saving processed files:', error);
      toast.error("Failed to save processed files");
    }
  };

  const resetToFileSelection = () => {
    setSelectedFiles([]);
    setProcessedFiles([]);
    setCurrentStep('select');
    setProgress(0);
    setProcessingFile('');
  };

  const getFileStatusIcon = (status: PdfFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show review step
  if (currentStep === 'review') {
    const completedFiles = processedFiles.filter(f => f.status === 'completed');
    
    if (completedFiles.length === 0) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Failed</h3>
                <p className="text-sm text-gray-600 mb-4">
                  All files failed to process. Please check the files and try again.
                </p>
                <Button onClick={resetToFileSelection} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (mergeOption === 'merge') {
      const mergedText = completedFiles.map(file => 
        `# ${file.suggestedTitle}\n\n${file.processedText}`
      ).join('\n\n---\n\n');

      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Merged Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessedContent
                processedText={mergedText}
                documentTitle={`Merged PDFs (${completedFiles.length} files)`}
                documentSubject="Documents"
                processingMethod="bulk-merge"
                onTitleChange={() => {}} // Read-only for merged content
                onSave={saveProcessedFiles}
                isSaving={false}
                isAiGenerated={completedFiles.some(f => f.isAiGenerated)}
                analysisConfidence={completedFiles.reduce((acc, f) => acc + (f.analysisConfidence || 0), 0) / completedFiles.length}
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={resetToFileSelection} variant="outline">
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Processed Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{file.name}</span>
                    {file.isAiGenerated && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Title:</strong> {file.suggestedTitle}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {file.suggestedSubject}
                  </p>
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    {file.processedText?.substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={saveProcessedFiles} className="bg-purple-600 hover:bg-purple-700">
                Save {completedFiles.length} Notes
              </Button>
              <Button onClick={resetToFileSelection} variant="outline">
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Multiple PDFs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pdf-files">Select PDF Files</Label>
            <Input
              id="pdf-files"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelection}
              className="mt-1"
              disabled={isProcessing}
            />
            <p className="text-sm text-gray-500 mt-1">
              Select multiple PDF files to import. Maximum 10 files at once.
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        {file.status === 'failed' && file.error && (
                          <p className="text-xs text-red-500">{file.error}</p>
                        )}
                      </div>
                    </div>
                    {file.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Merge className="h-5 w-5" />
              Import Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>How would you like to organize the imported content?</Label>
                <RadioGroup
                  value={mergeOption}
                  onValueChange={(value) => setMergeOption(value as 'merge' | 'separate')}
                  className="mt-2"
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="separate" id="separate" />
                    <Label htmlFor="separate" className="flex items-center gap-2">
                      <Split className="h-4 w-4" />
                      Create separate notes (one per PDF)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merge" id="merge" />
                    <Label htmlFor="merge" className="flex items-center gap-2">
                      <Merge className="h-4 w-4" />
                      Merge into one note (all PDFs combined)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    AI-Powered Processing
                  </Badge>
                </div>
                <p className="text-sm text-blue-700">
                  PDFs will be processed using Google Vision API (primary) with OpenAI API fallback. 
                  AI will automatically generate titles and detect subjects for better organization.
                </p>
              </div>

              <Button 
                onClick={processPdfFiles}
                disabled={isProcessing || selectedFiles.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? 'Processing...' : `Process ${selectedFiles.length} PDF${selectedFiles.length > 1 ? 's' : ''}`}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing: {processingFile}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
