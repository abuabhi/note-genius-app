import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, FileImage, AlertCircle, CheckCircle, Sparkles, Zap, FileText } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedContent } from "./components/ProcessedContent";
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

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const supportedFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (supportedFiles.length === 0) {
      toast.error("Please select valid image files (.png, .jpg, .webp) or PDF files");
      return;
    }

    if (supportedFiles.length === 1) {
      processFileSelection(supportedFiles[0]);
    } else {
      handleMultipleFiles(supportedFiles);
    }
  };

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
        
        if (supportedFiles.length === 1) {
          processFileSelection(supportedFiles[0]);
        } else {
          handleMultipleFiles(supportedFiles);
        }
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
          language: 'eng', // Default to English
          userId: userId,
          useOpenAI: isPremiumUser, // Use OpenAI for premium users, fallback for others
          enhanceImage: false, // Could be made configurable
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
        // Reset form
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
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing {fileType === 'application/pdf' ? 'PDF Document' : 'Image'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isPremiumUser 
                  ? "Using OpenAI Vision API for enhanced OCR accuracy..." 
                  : "Using Google Vision API with OpenAI fallback..."
                }
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  AI-powered text extraction with automatic title/subject detection in progress...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Camera className="h-5 w-5" />
            Document & Image Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? 'border-purple-500 bg-purple-50 scale-[1.02] shadow-lg' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp,.pdf';
              input.multiple = true;
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                const supportedFiles = files.filter(file => 
                  file.type.startsWith('image/') || file.type === 'application/pdf'
                );
                
                if (supportedFiles.length === 0) {
                  toast.error("Please select valid image or PDF files");
                  return;
                }

                if (supportedFiles.length === 1) {
                  processFileSelection(supportedFiles[0]);
                } else {
                  handleMultipleFiles(supportedFiles);
                }
              };
              input.click();
            }}
          >
            <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
              {isDragOver ? (
                <FileImage className="h-20 w-20 mb-6 text-purple-500 animate-bounce mx-auto" />
              ) : (
                <Upload className="h-16 w-16 mb-6 text-gray-400 mx-auto" />
              )}
            </div>
            
            <h3 className={`text-2xl font-bold mb-3 transition-colors ${
              isDragOver ? 'text-purple-700' : 'text-gray-700'
            }`}>
              {isDragOver ? 'Drop Documents Here!' : 'Drag & Drop or Click to Scan'}
            </h3>
            
            <p className={`text-lg mb-4 transition-colors ${
              isDragOver ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {isDragOver 
                ? 'Release to start processing your documents' 
                : 'Upload images or PDF files for OCR processing'
              }
            </p>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl transition-colors ${
              isDragOver ? 'bg-purple-100/50' : 'bg-gray-50'
            }`}>
              <div className="text-left">
                <div className="font-semibold text-sm mb-2 flex items-center">
                  <FileImage className="h-4 w-4 mr-2" />
                  Image Files
                </div>
                <ul className="text-xs space-y-1">
                  <li>• Standard OCR with AI analysis</li>
                  <li>• Handwriting recognition</li>
                  <li>• PNG, JPG, WebP, GIF, etc.</li>
                </ul>
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF Documents
                </div>
                <ul className="text-xs space-y-1">
                  <li>• Convert to image for OCR</li>
                  <li>• Process first page</li>
                  <li>• Automatic text extraction</li>
                </ul>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Supported: Images (PNG, JPG, GIF, BMP, TIFF, WebP) & PDF files
            </p>
          </div>

          {selectedFile && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <FileImage className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • 
                        {selectedFile.type === 'application/pdf' ? ' PDF Document' : ' Image'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Image/File Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    {selectedFile.type.startsWith('image/') && filePreviewUrl ? (
                      <img 
                        src={filePreviewUrl} 
                        alt="Selected document preview" 
                        className="w-full h-48 object-contain bg-white"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 bg-gray-100">
                        <div className="text-center p-4">
                          <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">PDF document</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">AI-Powered OCR Ready</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {isPremiumUser 
                        ? "Premium: OpenAI Vision API for maximum accuracy on handwritten text"
                        : "Using advanced Google Vision API with OpenAI fallback for best results"
                      }
                    </p>
                  </div>
                  
                  <Button 
                    onClick={processFile}
                    disabled={isProcessing}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isProcessing ? 'Processing...' : 'Extract Text with AI'}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
