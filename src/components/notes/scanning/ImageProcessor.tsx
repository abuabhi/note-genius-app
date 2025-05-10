
import { useState, useEffect } from "react";
import { AlertCircle, Globe } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { enhanceImage } from "@/utils/ocrUtils";
import { useOCRLanguage } from "./hooks/useOCRLanguage";
import { 
  ImagePreview, 
  TextOutput,
  OCRControls,
  ProcessingIndicator
} from "./ocr";

interface ImageProcessorProps {
  imageUrl: string | null;
  onReset: () => void;
  onTextExtracted: (text: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  isPremiumUser?: boolean;
}

export const ImageProcessor = ({ 
  imageUrl, 
  onReset, 
  onTextExtracted, 
  selectedLanguage,
  onLanguageChange,
  isPremiumUser = false
}: ImageProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [processedAt, setProcessedAt] = useState<string | null>(null);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const { toast } = useToast();
  const { availableLanguages, getLanguageNameByCode } = useOCRLanguage();

  useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl);
    }
  }, [imageUrl, selectedLanguage]);

  const processImage = async (url: string) => {
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
      setRecognizedText(data.text);
      setConfidence(data.confidence);
      setProcessedAt(data.processedAt);
      onTextExtracted(data.text);
      
      const providerName = data.provider === 'openai' ? 'OpenAI' : 
                           data.provider === 'google-vision' ? 'Google Vision' : 
                           data.provider === 'mock' ? 'Demo Mode' :
                           'OCR Engine';
      
      toast({
        title: "Text Extracted",
        description: `OCR processing complete with ${Math.round(data.confidence * 100)}% confidence using ${providerName}.`,
      });
    } catch (error) {
      console.error("OCR processing error:", error);
      setProcessingError((error as Error).message || "Failed to process image");
      toast({
        title: "Processing Failed",
        description: "Could not extract text from the image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRecognizedText(newText);
    onTextExtracted(newText);
  };

  const handleRetry = async () => {
    if (imageUrl) {
      await processImage(imageUrl);
    }
  };

  const handleLanguageChange = (value: string) => {
    onLanguageChange(value);
    if (imageUrl) {
      processImage(imageUrl);
    }
  };

  const toggleOpenAI = () => {
    const newValue = !useOpenAI;
    setUseOpenAI(newValue);
    if (newValue && !isPremiumUser) {
      toast({
        title: "Premium Feature",
        description: "OpenAI processing is only available for premium users. Using standard OCR instead.",
        variant: "destructive",
      });
      return;
    }
    
    if (imageUrl) {
      processImage(imageUrl);
    }
  };

  const toggleImageEnhancement = () => {
    const newValue = !isEnhanced;
    setIsEnhanced(newValue);
    if (imageUrl) {
      processImage(imageUrl);
    }
  };

  if (!imageUrl) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <ImagePreview 
          imageUrl={imageUrl}
          onReset={onReset}
          onRetryOCR={handleRetry}
          isProcessing={isProcessing}
        />
        
        <OCRControls 
          isEnhanced={isEnhanced}
          onEnhancementChange={toggleImageEnhancement}
          useOpenAI={useOpenAI}
          onOpenAIChange={toggleOpenAI}
          isProcessing={isProcessing}
          isPremiumUser={isPremiumUser}
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Extracted Text</p>
          
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
            
            <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isProcessing}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(language => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {processingError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{processingError}</AlertDescription>
          </Alert>
        ) : null}
        
        {isProcessing ? (
          <ProcessingIndicator 
            useOpenAI={useOpenAI}
            isPremiumUser={isPremiumUser}
            isEnhanced={isEnhanced}
            language={selectedLanguage}
            getLanguageNameByCode={getLanguageNameByCode}
          />
        ) : (
          <TextOutput 
            recognizedText={recognizedText}
            handleTextChange={handleTextChange}
            confidence={confidence}
            processedAt={processedAt}
            useOpenAI={useOpenAI}
            isPremiumUser={isPremiumUser}
          />
        )}
      </div>
    </div>
  );
};
