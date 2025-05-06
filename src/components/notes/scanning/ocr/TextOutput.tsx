
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface TextOutputProps {
  recognizedText: string;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  confidence: number | null;
  processedAt: string | null;
  useOpenAI: boolean;
  isPremiumUser: boolean;
}

export const TextOutput = ({
  recognizedText,
  handleTextChange,
  confidence,
  processedAt,
  useOpenAI,
  isPremiumUser
}: TextOutputProps) => {
  return (
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
  );
};
