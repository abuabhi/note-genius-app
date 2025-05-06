
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";

interface OCRControlsProps {
  isEnhanced: boolean;
  onEnhancementChange: () => void;
  useOpenAI: boolean;
  onOpenAIChange: () => void;
  isProcessing: boolean;
  isPremiumUser: boolean;
}

export const OCRControls = ({
  isEnhanced,
  onEnhancementChange,
  useOpenAI,
  onOpenAIChange,
  isProcessing,
  isPremiumUser,
}: OCRControlsProps) => {
  return (
    <div className="mt-4 space-y-4 border rounded-md p-3 bg-muted/30">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="enhance-toggle" className="text-sm">Image Enhancement</Label>
          <Switch 
            id="enhance-toggle" 
            checked={isEnhanced} 
            onCheckedChange={onEnhancementChange} 
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
              onCheckedChange={onOpenAIChange} 
              disabled={isProcessing || !isPremiumUser} 
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Uses OpenAI's advanced image recognition for superior results
          </p>
        </div>
      )}
    </div>
  );
};
