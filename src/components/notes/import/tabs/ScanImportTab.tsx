
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedContent } from "./components/ProcessedContent";
import { FilePreview } from "./components/FilePreview";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { useDragAndDrop } from "../../scanning/hooks/useDragAndDrop";
import { useBatchProcessing } from "../../scanning/hooks/useBatchProcessing";
import { BatchProcessingView } from "../../scanning/BatchProcessingView";
import { SimplifiedFileSelector } from "./components/SimplifiedFileSelector";

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

  const {
    isDragOver,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState
  } = useDragAndDrop();

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

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, PNG, JPG, and WebP files are supported");
      return false;
    }

    const maxSize = file.type === 'application/pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File must be smaller than ${file.type === 'application/pdf' ? '50MB' : '10MB'}`);
      return false;
    }

    return true;
  };

  const processFileSelection = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setFileType(file.type);
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
    setExtractedText('');
    setDocumentSubject('');
    setProcessingMethod('');
    setIsAiGenerated(false);
    setAnalysisConfidence(0);
    setCurrentStep('select');

    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    } else {
      setFilePreviewUrl('');
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length === 0) {
      toast.error("No valid files selected");
      return;
    }

    if (validFiles.length > 3) {
      toast.error("Maximum 3 files allowed");
      return;
    }

    console.log(`Starting batch processing for ${validFiles.length} files`);
    setCurrentStep('batch');
    processBatchImages(validFiles);
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
        fetch(fileUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'dropped-file', { type: blob.type });
            processFileSelection(file);
          });
      },
      (files: File[]) => {
        handleFileSelect(files);
      }
    );
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setCurrentStep('process');
    
    try {
      console.log("🔄 Starting OCR processing for file:", selectedFile.name, "Type:", selectedFile.type);

      const fileUrl = await uploadFileToStorage(selectedFile);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

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

      // Auto-generate title and subject using AI content analysis
      if (extractedText.trim() && userId) {
        try {
          console.log("🤖 Starting AI content analysis for auto title/subject generation...");
          
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
            console.log("✅ AI auto-generated title and subject successfully");
            
            toast.success("Text extracted and title/subject auto-generated!");
          } else {
            console.warn("⚠️ AI content analysis failed, using fallback title/subject");
            toast.success("Text extracted successfully!");
          }
        } catch (analysisError) {
          console.warn("⚠️ Content analysis failed:", analysisError);
          toast.success("Text extracted successfully!");
        }
      } else {
        toast.success(`${selectedFile.type === 'application/pdf' ? 'PDF' : 'Image'} processed successfully!`);
      }

      setCurrentStep('review');
      
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

  if (currentStep === 'batch') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-mint-600" />
              Batch Processing
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

  if (currentStep === 'process') {
    return (
      <div className="space-y-6">
        <ProcessingStatus fileType={fileType} isPremiumUser={isPremiumUser || false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SimplifiedFileSelector
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
                Premium users get enhanced handwriting recognition and better accuracy.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
