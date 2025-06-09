
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, FileImage, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProcessedContent } from "./components/ProcessedContent";

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
  const [currentStep, setCurrentStep] = useState<'select' | 'process' | 'review'>('select');

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

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
    }
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
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
        category: 'Scanned Documents',
        subject: documentSubject || 'Uncategorized'
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
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  };

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
                Scan Another Image
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Document or Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-file">Select Image</Label>
            <Input
              id="image-file"
              type="file"
              onChange={handleImageSelected}
              accept=".png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF, WebP (max 10MB)
            </p>
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
