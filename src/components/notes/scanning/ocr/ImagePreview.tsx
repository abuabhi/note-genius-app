
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface ImagePreviewProps {
  imageUrl: string;
  onReset: () => void;
  onRetryOCR: () => void;
  isProcessing: boolean;
}

export const ImagePreview = ({ 
  imageUrl, 
  onReset, 
  onRetryOCR, 
  isProcessing 
}: ImagePreviewProps) => {
  return (
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
          onClick={onRetryOCR}
          disabled={isProcessing}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Retry OCR
        </Button>
      </div>
    </div>
  );
};
