
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processImageWithOCR } from "@/utils/ocrUtils";

interface ImageProcessorProps {
  imageUrl: string | null;
  onReset: () => void;
  onTextExtracted: (text: string) => void;
}

export const ImageProcessor = ({ imageUrl, onReset, onTextExtracted }: ImageProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl);
    }
  }, [imageUrl]);

  const processImage = async (url: string) => {
    setIsProcessing(true);
    
    try {
      // Using our utility for OCR processing
      const { text } = await processImageWithOCR(url);
      setRecognizedText(text);
      onTextExtracted(text);
      setIsProcessing(false);
    } catch (error) {
      console.error("OCR processing error:", error);
      setIsProcessing(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRecognizedText(newText);
    onTextExtracted(newText);
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
        <Button 
          variant="outline" 
          className="mt-2 w-full"
          onClick={onReset}
        >
          Try Again
        </Button>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">Extracted Text</p>
        {isProcessing ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-700 mx-auto"></div>
              <p className="mt-4 text-sm text-mint-700">Processing your image...</p>
            </div>
          </div>
        ) : (
          <Textarea 
            value={recognizedText}
            onChange={handleTextChange}
            className="min-h-[200px]"
            placeholder="Extracted text will appear here..."
          />
        )}
      </div>
    </div>
  );
};
