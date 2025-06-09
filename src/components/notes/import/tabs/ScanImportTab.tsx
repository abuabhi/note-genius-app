
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, AlertCircle } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedContent } from "./components/ProcessedContent";
import { FileSelector } from "./components/FileSelector";
import { FilePreview } from "./components/FilePreview";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { useDragAndDrop } from "../../scanning/hooks/useDragAndDrop";
import { useBatchProcessing } from "../../scanning/hooks/useBatchProcessing";
import { BatchProcessingView } from "../../scanning/BatchProcessingView";

interface ScanImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentSubject, setDocumentSubject] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<string>('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<'select' | 'process' | 'review' | 'batch'>('select');
  const [fileType, setFileType] = useState<string>('');

  const uploadFileToStorage = async (file: File | string): Promise<string> => {
    let fileToUpload: File;
    
    if (typeof file === 'string') {
      // Convert data URL to file
      const response = await fetch(file);
      const blob = await response.blob();
      fileToUpload = new File([blob], 'file.png', { type: blob.type });
    } else {
      fileToUpload = file;
    }

    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, fileToUpload);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Add drag and drop functionality
  const {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState
  } = useDragAndDrop();

  // Add batch processing functionality
  const { 
    processedImages, 
    batchProgress, 
    processBatchImages, 
    resetBatchProcessing 
  } = useBatchProcessing({ 
    selectedLanguage: 'eng', 
    isPremiumUser, 
    uploadImageToStorage: uploadFileToStorage 
  });

  const processFileSelection = (file: File) => {
    // Validate file size (max 50MB for PDFs, 10MB for images)
    const maxSize = file.type === 'application/pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File must be smaller than ${file.type === 'application/pdf' ? '50MB' : '10MB'}`);
      return;
    }

    setSelectedFile(file);
    setFileType(file.type);
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    setExtractedText(''); // Clear previous content
    setDocumentSubject('');
    setProcessingMethod('');
    setIsAiGenerated(false);
    setAnalysisConfidence(0);
    setCurrentStep('select');

    // Create preview URL
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    } else {
      // For PDFs, we'll show a file icon preview
      setFilePreviewUrl('');
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    console.log(`Starting batch processing for ${files.length} files`);
    setCurrentStep('batch');
    processBatchImages(files);
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 1) {
      processFileSelection(files[0]);
    } else {
      handleMultipleFiles(files);
    }
  };

  const handleDropEvent = (e: React.DragEvent) => {
    handleDrop(e, 
      (fileUrl: string) => {
        // Handle single file from drag and drop
        fetch(fileUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'dropped-file', { type: blob.type });
            processFileSelection(file);
          });
      },
      (files: File[]) => {
        // Handle multiple files
        const supportedFiles = files.filter(file => 
          file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        
        if (supportedFiles.length === 0) {
          toast.error("No valid image or PDF files found");
          return;
        }
        
        handleFileSelect(supportedFiles);
      }
    );
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setCurrentStep('process');
    
    try {
      console.log("🔄 Starting OCR processing for file:", selectedFile.name, "Type:", selectedFile.type);

      // Upload file to Supabase storage
      const fileUrl = await uploadFileToStorage(selectedFile);
      
      // Get current user session for content analysis
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Call the unified process-file edge function
      const { data: ocrResult, error: ocrError } = await supabase.functions.invoke('process-file', {
        body: { 
          fileUrl,
          language: 'eng',
          userId: userId,
          useOpenAI: isPremiumUser,
          enhanceImage: false,
          fileType: selectedFile.type
        }
      });

      if (ocrError) {
        throw new Error(ocrError.message || "Failed to process file");
      }

      if (!ocrResult || !ocrResult.text) {
        throw new Error("No text could be extracted from the file");
      }

      console.log("✅ OCR processing completed successfully");
      
      const extractedText = ocrResult.text;
      setExtractedText(extractedText);
      setProcessingMethod(ocrResult.provider || 'unknown');

      // If we have extracted text and user ID, analyze content for title/subject
      if (extractedText.trim() && userId) {
        try {
          console.log("🤖 Starting AI content analysis...");
          
          // Call process-document for content analysis
          const textBlob = new Blob([extractedText], { type: 'text/plain' });
          const textFile = new File([textBlob], 'extracted-text.txt', { type: 'text/plain' });
          const textFileUrl = await uploadFileToStorage(textFile);

          const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('process-document', {
            body: {
              fileUrl: textFileUrl,
              fileType: 'txt',
              userId: userId,
              extractedText: extractedText
            }
          });

          if (!analysisError && analysisResult?.success) {
            setDocumentTitle(analysisResult.title || selectedFile.name.replace(/\.[^/.]+$/, ""));
            setDocumentSubject(analysisResult.subject || "Uncategorized");
            setIsAiGenerated(analysisResult.metadata?.contentAnalysis?.aiGeneratedTitle || false);
            setAnalysisConfidence(analysisResult.metadata?.contentAnalysis?.confidence || 0);
            console.log("✅ AI content analysis completed");
          } else {
            console.warn("⚠️ AI content analysis failed, using fallback");
          }
        } catch (analysisError) {
          console.warn("⚠️ Content analysis failed:", analysisError);
          // Continue without AI analysis - not critical
        }
      }

      setCurrentStep('review');
      toast.success(`${selectedFile.type === 'application/pdf' ? 'PDF' : 'Image'} processed successfully!`);
      
    } catch (error) {
      console.error('❌ Error processing file:', error);
      toast.error(`Failed to process file: ${error.message}`);
      setCurrentStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsNote = async () => {
    if (!extractedText || !documentTitle) return;

    setIsSaving(true);
    try {
      const note: Omit<Note, 'id'> = {
        title: documentTitle,
        content: extractedText,
        description: `Scanned from ${selectedFile?.name || 'file'}`,
        tags: [
          { name: 'OCR', color: '#F59E0B' }, 
          { name: fileType === 'application/pdf' ? 'PDF Scan' : 'Image Scan', color: '#8B5CF6' },
          ...(isAiGenerated ? [{ name: 'AI Generated', color: '#10B981' }] : [])
        ],
        sourceType: 'scan',
        pinned: false,
        archived: false,
        date: new Date().toISOString().split('T')[0],
        category: 'Scanned Documents'
      };

      const success = await onSaveNote(note);
      if (success) {
        toast.success("Note saved successfully!");
        resetForm();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const saveBatchAsNotes = async () => {
    setIsSaving(true);
    const completedImages = processedImages.filter(img => img.status === 'completed');

    try {
      for (const image of completedImages) {
        const note: Omit<Note, 'id'> = {
          title: image.title,
          content: image.recognizedText,
          description: `Scanned from batch processing`,
          tags: [
            { name: 'OCR', color: '#F59E0B' }, 
            { name: 'Batch Scan', color: '#8B5CF6' }
          ],
          sourceType: 'scan',
          pinned: false,
          archived: false,
          date: new Date().toISOString().split('T')[0],
          category: image.category
        };

        await onSaveNote(note);
      }

      toast.success(`Saved ${completedImages.length} notes successfully!`);
      resetForm();
    } catch (error) {
      console.error("Error saving batch notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFilePreviewUrl('');
    setExtractedText('');
    setDocumentTitle('');
    setDocumentSubject('');
    setProcessingMethod('');
    setIsAiGenerated(false);
    setAnalysisConfidence(0);
    setCurrentStep('select');
    setFileType('');
    resetBatchProcessing();
    resetDragState();
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
  };

  // Show batch processing view
  if (currentStep === 'batch') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Batch Processing - Up to 3 Documents Simultaneously
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BatchProcessingView
              processedImages={processedImages}
              batchProgress={batchProgress}
              onSaveBatch={saveBatchAsNotes}
              onReset={resetForm}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show review step
  if (currentStep === 'review') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Extracted Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessedContent
              processedText={extractedText}
              documentTitle={documentTitle}
              documentSubject={documentSubject}
              processingMethod={processingMethod}
              onTitleChange={setDocumentTitle}
              onSubjectChange={setDocumentSubject}
              onSave={saveAsNote}
              isSaving={isSaving}
              isAiGenerated={isAiGenerated}
              analysisConfidence={analysisConfidence}
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={resetForm} variant="outline">
                Scan More Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show processing step
  if (currentStep === 'process') {
    return (
      <div className="space-y-6">
        <ProcessingStatus fileType={fileType} isPremiumUser={isPremiumUser || false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Feature Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-purple-700">Professional Document Scanning & OCR</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
          <div>
            <strong>🚀 Batch Processing:</strong> Scan up to 3 documents simultaneously
          </div>
          <div>
            <strong>🤖 AI-Powered:</strong> {isPremiumUser ? 'OpenAI Vision (Premium)' : 'Google Vision + OpenAI fallback'} 
          </div>
          <div>
            <strong>✍️ Multi-Format:</strong> Images & PDFs supported with smart processing
          </div>
          <div>
            <strong>📊 Smart Analysis:</strong> Automatic title detection and content categorization
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Document & Image Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileSelector
            isDragOver={isDragOver}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
            onFileSelect={handleFileSelect}
          />

          {selectedFile && (
            <FilePreview
              selectedFile={selectedFile}
              filePreviewUrl={filePreviewUrl}
              isProcessing={isProcessing}
              isPremiumUser={isPremiumUser || false}
              onProcess={processFile}
            />
          )}

          {!isPremiumUser && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Enhanced OCR Available</span>
              </div>
              <p className="text-sm text-yellow-700">
                Premium users get priority access to OpenAI Vision API for enhanced handwriting recognition, 
                better accuracy on complex documents, and advanced content analysis features.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
