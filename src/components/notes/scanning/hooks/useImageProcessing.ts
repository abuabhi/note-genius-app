
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { enhanceImage } from "@/utils/ocrUtils";
import { useToast } from "@/hooks/use-toast";

export interface ImageProcessingOptions {
  imageUrl: string | null;
  selectedLanguage: string;
  useOpenAI: boolean;
  isEnhanced: boolean;
  isPremiumUser: boolean;
  onTextExtracted: (text: string) => void;
}

export interface ProcessingResult {
  recognizedText: string;
  confidence: number | null;
  processedAt: string | null;
  provider?: string;
}

export const useImageProcessing = ({
  imageUrl,
  selectedLanguage,
  useOpenAI,
  isEnhanced,
  isPremiumUser,
  onTextExtracted
}: ImageProcessingOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [processedAt, setProcessedAt] = useState<string | null>(null);
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const { toast } = useToast();

  const processImage = async (url: string) => {
    if (!url) return;
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      console.log("Starting OCR processing...");
      setProcessingAttempts(prev => prev + 1);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Apply enhancement if requested
      let processedUrl = url;
      if (isEnhanced) {
        try {
          console.log("Enhancing image before OCR processing");
          processedUrl = await enhanceImage(url);
        } catch (enhanceError) {
          console.error('Image enhancement error:', enhanceError);
          toast({
            title: "Enhancement Warning",
            description: "Image enhancement failed, processing original image.",
            variant: "destructive",
          });
        }
      }

      console.log("Calling process-image edge function");
      
      // Call our Supabase edge function for OCR processing
      const { data, error } = await supabase.functions.invoke('process-image', {
        body: { 
          imageUrl: processedUrl,
          language: selectedLanguage,
          userId: userId, // Pass user ID if available
          useOpenAI: useOpenAI && isPremiumUser, // Only use OpenAI if user is premium
          enhanceImage: isEnhanced // Pass enhancement flag
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to process image");
      }
      
      if (!data || !data.text) {
        console.error("Invalid response data:", data);
        throw new Error("Invalid response from OCR service");
      }
      
      console.log("OCR processing completed successfully:", data);
      
      // Process response data
      const resultText = data.text;
      setRecognizedText(resultText);
      setConfidence(data.confidence);
      setProcessedAt(data.processedAt);
      onTextExtracted(resultText);
      
      const providerName = data.provider === 'openai' ? 'OpenAI' : 
                           data.provider === 'google-vision' ? 'Google Vision' : 
                           data.provider === 'mock' ? 'Demo Mode' :
                           'OCR Engine';
      
      toast({
        title: "Text Extracted",
        description: `OCR processing complete with ${Math.round(data.confidence * 100)}% confidence using ${providerName}.`,
      });
      
      return {
        recognizedText: resultText,
        confidence: data.confidence,
        processedAt: data.processedAt,
        provider: data.provider
      } as ProcessingResult;
      
    } catch (error) {
      console.error("OCR processing error:", error);
      const errorMsg = (error as Error).message || "Failed to process image";
      setProcessingError(errorMsg);
      toast({
        title: "Processing Failed",
        description: "Could not extract text from the image.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async () => {
    if (imageUrl) {
      await processImage(imageUrl);
    }
  };

  // Initial processing when URL changes
  const initProcessing = async () => {
    if (imageUrl) {
      await processImage(imageUrl);
    }
  };

  return {
    isProcessing,
    recognizedText,
    setRecognizedText,
    processingError,
    confidence,
    processedAt,
    processingAttempts,
    handleRetry,
    processImage,
    initProcessing
  };
};
