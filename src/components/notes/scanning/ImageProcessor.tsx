
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RotateCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageProcessorProps {
  imageUrl: string | null;
  onReset: () => void;
  onTextExtracted: (text: string) => void;
}

export const ImageProcessor = ({ imageUrl, onReset, onTextExtracted }: ImageProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [processedAt, setProcessedAt] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl);
    }
  }, [imageUrl]);

  const processImage = async (url: string) => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Call our Supabase edge function for OCR processing
      const { data, error } = await supabase.functions.invoke('process-image', {
        body: { 
          imageUrl: url,
          language: selectedLanguage,
          userId: userId // Pass user ID if available
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
    setSelectedLanguage(value);
    if (imageUrl) {
      processImage(imageUrl);
    }
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
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Extracted Text</p>
          
          <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isProcessing}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng">English</SelectItem>
              <SelectItem value="fra">French</SelectItem>
              <SelectItem value="spa">Spanish</SelectItem>
              <SelectItem value="deu">German</SelectItem>
              <SelectItem value="chi_sim">Chinese</SelectItem>
              <SelectItem value="jpn">Japanese</SelectItem>
            </SelectContent>
          </Select>
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
              <p className="mt-4 text-sm text-mint-700">Processing your image...</p>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};
