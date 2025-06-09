import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, FileImage, AlertCircle, CheckCircle, Sparkles, Files } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentSubject, setDocumentSubject] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<string>('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<'select' | 'process' | 'review' | 'batch'>('select');

  const uploadImageToStorage = async (file: File | string): Promise<string> => {
    let fileToUpload: File;
    
    if (typeof file === 'string') {
      // Convert data URL to file
      const response = await fetch(file);
      const blob = await response.blob();
      fileToUpload = new File([blob], 'image.png', { type: blob.type });
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
    uploadImageToStorage 
  });

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    if (imageFiles.length === 1) {
      processFileSelection(imageFiles[0]);
    } else {
      handleMultipleFiles(imageFiles);
    }
  };

  const processFileSelection = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be smaller than 10MB");
      return;
    }

    setSelectedImage(file);
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    setExtractedText(''); // Clear previous content
    setDocumentSubject('');
    setProcessingMethod('');
    setIsAiGenerated(false);
    setAnalysisConfidence(0);
    setCurrentStep('select');

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleMultipleFiles = (files: File[]) => {
    console.log(`Starting batch processing for ${files.length} images`);
    setCurrentStep('batch');
    processBatchImages(files);
  };

  const handleDropEvent = (e: React.DragEvent) => {
    handleDrop(e, 
      (imageUrl: string) => {
        // Handle single image from drag and drop
        fetch(imageUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'dropped-image.png', { type: blob.type });
            processFileSelection(file);
          });
      },
      (files: File[]) => {
        // Handle multiple files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
          toast.error("No valid image files found");
          return;
        }
        
        if (imageFiles.length === 1) {
          processFileSelection(imageFiles[0]);
        } else {
          handleMultipleFiles(imageFiles);
        }
      }
    );
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setCurrentStep('process');
    
    try {
      console.log("🔄 Starting OCR processing for image:", selectedImage.name);

      // Upload image to Supabase storage
      const imageUrl = await uploadImageToStorage(selectedImage);
      
      // Get current user session for content analysis
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Call the process-image edge function
      const { data: ocrResult, error: ocrError } = await supabase.functions.invoke('process-image', {
        body: { 
          imageUrl,
          language: 'eng', // Default to English
          userId: userId,
          useOpenAI: isPremiumUser, // Use OpenAI for premium users, fallback for others
          enhanceImage: false // Could be made configurable
        }
      });

      if (ocrError) {
        throw new Error(ocrError.message || "Failed to process image");
      }

      if (!ocrResult || !ocrResult.text) {
        throw new Error("No text could be extracted from the image");
      }

      console.log("✅ OCR processing completed successfully");
      
      const extractedText = ocrResult.text;
      setExtractedText(extractedText);
      setProcessingMethod(ocrResult.provider || 'unknown');

      // If we have extracted text and user ID, analyze content for title/subject
      if (extractedText.trim() && userId) {
        try {
          console.log("🤖 Starting AI content analysis...");
          
          // We'll call the same process-document function but with extracted text
          // First upload the text as a temporary text file for analysis
          const textBlob = new Blob([extractedText], { type: 'text/plain' });
          const textFile = new File([textBlob], 'extracted-text.txt', { type: 'text/plain' });
          const textFileUrl = await uploadImageToStorage(textFile);

          // Call process-document for content analysis (it will analyze the text)
          const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('process-document', {
            body: {
              fileUrl: textFileUrl,
              fileType: 'txt',
              userId: userId,
              extractedText: extractedText // Pass the text directly for analysis
            }
          });

          if (!analysisError && analysisResult?.success) {
            setDocumentTitle(analysisResult.title || selectedImage.name.replace(/\.[^/.]+$/, ""));
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
      toast.success("Image processed successfully!");
      
    } catch (error) {
      console.error('❌ Error processing image:', error);
      toast.error(`Failed to process image: ${error.message}`);
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
        description: `Scanned from ${selectedImage?.name || 'image'}`,
        tags: [
          { name: 'OCR', color: '#F59E0B' }, 
          { name: 'Scan', color: '#8B5CF6' },
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
    setSelectedImage(null);
    setImagePreviewUrl('');
    setExtractedText('');
    setDocumentTitle('');
    setDocumentSubject('');
    setProcessingMethod('');
    setIsAiGenerated(false);
    setAnalysisConfidence(0);
    setCurrentStep('select');
    resetBatchProcessing();
    resetDragState();
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  };

  // Show batch processing view
  if (currentStep === 'batch') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Batch Processing</CardTitle>
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
                Scan More Images
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Image</h3>
              <p className="text-sm text-gray-600 mb-4">
                {isPremiumUser 
                  ? "Using OpenAI Vision API for enhanced OCR accuracy..." 
                  : "Using Google Vision API with OpenAI fallback..."
                }
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  AI-powered text extraction and automatic title/subject detection in progress...
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
      {/* Batch Processing Limit Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Files className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">Batch Processing Limit</span>
        </div>
        <p className="text-sm text-amber-700">
          <strong>Single file limit:</strong> This tab processes one image at a time.<br/>
          <strong>For batch processing:</strong> Use the main "Scan Handwritten Note" feature to process up to 3 documents simultaneously.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Documents & Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-file">Select Images</Label>
            <Input
              id="image-file"
              type="file"
              onChange={handleImageSelected}
              accept=".png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp"
              multiple
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF, WebP (max 10MB each)
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? 'border-purple-500 bg-purple-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropEvent}
            onClick={() => document.getElementById('image-file')?.click()}
          >
            <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
              {isDragOver ? (
                <FileImage className="h-16 w-16 mb-4 text-purple-500 animate-bounce mx-auto" />
              ) : (
                <Upload className="h-12 w-12 mb-4 text-gray-400 mx-auto" />
              )}
            </div>
            
            <p className={`text-lg font-medium mb-2 transition-colors ${
              isDragOver ? 'text-purple-700' : 'text-gray-700'
            }`}>
              {isDragOver ? 'Drop your images here!' : 'Drag & Drop Images Here'}
            </p>
            
            <p className={`text-sm mb-3 transition-colors ${
              isDragOver ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {isDragOver 
                ? 'Release to process your images' 
                : 'Or click to select files'
              }
            </p>
            
            <div className={`text-xs p-3 rounded-lg transition-colors ${
              isDragOver ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <p>
                <strong>Single image:</strong> Standard OCR with AI analysis
              </p>
              <p>
                <strong>Multiple images:</strong> Batch processing with progress tracking
              </p>
              <p className="mt-1">
                <strong>AI-Powered:</strong> {isPremiumUser ? 'OpenAI Vision (Premium)' : 'Google Vision + OpenAI fallback'}
              </p>
            </div>
          </div>

          {selectedImage && imagePreviewUrl && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileImage className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{selectedImage.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Selected image preview" 
                      className="w-full h-48 object-contain bg-white"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">AI-Powered OCR</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {isPremiumUser 
                        ? "Premium users get priority access to OpenAI Vision API for enhanced accuracy"
                        : "Using Google Vision API (primary) with OpenAI fallback for best results"
                      }
                    </p>
                  </div>
                  
                  <Button 
                    onClick={processImage}
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
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Enhanced Features Available</span>
              </div>
              <p className="text-sm text-yellow-700">
                Premium users get priority access to OpenAI Vision API for enhanced OCR accuracy, 
                handwriting recognition, and advanced content analysis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
