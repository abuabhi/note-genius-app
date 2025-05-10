
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useOCRLanguage } from "./hooks/useOCRLanguage";
import { 
  ImagePreview, 
  TextOutput,
  OCRControls,
  ProcessingIndicator
} from "./ocr";
import { useImageProcessing } from "./hooks/useImageProcessing";
import { LanguageSelector } from "./ocr/LanguageSelector";
import { ErrorDisplay } from "./ocr/ErrorDisplay";

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
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const { availableLanguages, getLanguageNameByCode } = useOCRLanguage();
  
  // Use the custom hook for processing logic
  const {
    isProcessing,
    recognizedText,
    setRecognizedText,
    processingError,
    confidence,
    processedAt,
    handleRetry,
    processImage,
    initProcessing
  } = useImageProcessing({
    imageUrl,
    selectedLanguage,
    useOpenAI,
    isEnhanced,
    isPremiumUser,
    onTextExtracted
  });

  useEffect(() => {
    if (imageUrl) {
      initProcessing();
    }
  }, [imageUrl, selectedLanguage]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRecognizedText(newText);
    onTextExtracted(newText);
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
          
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            availableLanguages={availableLanguages}
            isProcessing={isProcessing}
          />
        </div>
        
        <ErrorDisplay error={processingError || ''} />
        
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
