
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Globe, RotateCw, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAvailableOCRLanguages, enhanceImage } from "@/utils/ocrUtils";
import { Badge } from "@/components/ui/badge";

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
  const { toast } = useToast();
  const availableLanguages = getAvailableOCRLanguages();

  useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl);
    }
  }, [imageUrl, selectedLanguage]);

  const processImage = async (url: string) => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Apply enhancement if requested
      let processedUrl = url;
      if (isEnhanced) {
        try {
          processedUrl = await enhanceImage(url);
        } catch (enhanceError) {
          console.error('Image enhancement error:', enhanceError);
          toast({
            title: "Enhancement Warning",
            description: "Image enhancement failed, processing original image.",
            variant: "warning",
          });
        }
      }

      // Call our Supabase edge function for OCR processing
      const { data, error } = await supabase.functions.invoke('process-image', {
        body: { 
          imageUrl: processedUrl,
          language: selectedLanguage,
          userId: userId, // Pass user ID if available
          useOpenAI: useOpenAI && isPremiumUser // Only use OpenAI if user is premium
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setRecognizedText(data.text);
      setConfidence(data.confidence);
      setProcessedAt(data.processedAt);
      onTextExtracted(data.text);
      
      toast({
        title: "Text Extracted",
        description: `OCR processing complete with ${Math.round(data.confidence * 100)}% confidence.`,
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
        description: "OpenAI processing is only available for premium users. Using Tesseract OCR instead.",
        variant: "warning",
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

  const getLanguageNameByCode = (code: string): string => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  if (!imageUrl) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium mb-2">Original Image</p>
        <img 
          src={imageUrl} 
          alt="Captured note" 
          className="w-full h-auto rounded-md border border-input"
        />
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onReset}
          >
            Try Again
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={handleRetry}
            disabled={isProcessing}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Retry OCR
          </Button>
        </div>
        
        <div className="mt-4 space-y-4 border rounded-md p-3 bg-muted/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="enhance-toggle" className="text-sm">Image Enhancement</Label>
              <Switch 
                id="enhance-toggle" 
                checked={isEnhanced} 
                onCheckedChange={toggleImageEnhancement} 
                disabled={isProcessing} 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Improves contrast and readability for better OCR results
            </p>
          </div>

          {isPremiumUser && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="openai-toggle" className="text-sm mr-2">OpenAI Processing</Label>
                  <Badge variant="secondary" className="h-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    Premium
                  </Badge>
                </div>
                <Switch 
                  id="openai-toggle" 
                  checked={useOpenAI} 
                  onCheckedChange={toggleOpenAI} 
                  disabled={isProcessing || !isPremiumUser} 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Uses OpenAI's advanced image recognition for superior results
              </p>
            </div>
          )}
        </div>
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
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-700 mx-auto"></div>
              <p className="mt-4 text-sm text-mint-700">
                {useOpenAI && isPremiumUser ? (
                  <>
                    <Sparkles className="inline-block mr-1 h-4 w-4 text-blue-500" />
                    Processing with OpenAI...
                  </>
                ) : (
                  <>Processing your image in {getLanguageNameByCode(selectedLanguage)}...</>
                )}
              </p>
              {isEnhanced && <p className="text-xs text-muted-foreground mt-1">With image enhancement</p>}
            </div>
          </div>
        ) : (
          <>
            <Textarea 
              value={recognizedText}
              onChange={handleTextChange}
              className="min-h-[200px]"
              placeholder="Extracted text will appear here..."
            />
            
            <div className="mt-2 flex flex-col space-y-1">
              {confidence !== null && (
                <p className="text-xs text-muted-foreground">
                  OCR Confidence: {Math.round(confidence * 100)}%
                </p>
              )}
              {processedAt && (
                <p className="text-xs text-muted-foreground">
                  Processed: {new Date(processedAt).toLocaleString()}
                </p>
              )}
              {useOpenAI && isPremiumUser && (
                <p className="text-xs font-medium text-blue-500 flex items-center">
                  <Sparkles className="inline-block mr-1 h-3 w-3" />
                  Processed with OpenAI
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
