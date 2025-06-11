
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recognizedText);
      toast({
        title: "Copied to clipboard",
        description: "The transcribed text has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Simple markdown to HTML converter for basic preview
  const renderMarkdownPreview = (text: string) => {
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-3 mb-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-md font-medium mt-2 mb-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/^\d+\.\s(.*)$/gim, '<li class="ml-4">$1</li>')
      .replace(/^-\s(.*)$/gim, '<li class="ml-4 list-disc list-inside">$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Extracted Text</h3>
        <div className="flex gap-2">
          {recognizedText && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-8"
              >
                <Eye className="h-3 w-3 mr-1" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Text content area */}
      <div className="border rounded-md">
        {showPreview ? (
          <ScrollArea className="h-[200px] w-full">
            <div 
              className="p-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdownPreview(recognizedText) 
              }}
            />
          </ScrollArea>
        ) : (
          <Textarea 
            value={recognizedText}
            onChange={handleTextChange}
            className="min-h-[200px] max-h-[200px] resize-none border-0 focus-visible:ring-0"
            placeholder="Extracted text will appear here..."
          />
        )}
      </div>
      
      {/* Metadata */}
      <div className="flex flex-col space-y-1">
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
            Processed with OpenAI Vision (Enhanced Markdown)
          </p>
        )}
      </div>
    </div>
  );
};
