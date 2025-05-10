
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { TextAlignType } from "./hooks/useStudyViewState";
import { RichTextDisplay } from "@/components/ui/rich-text/RichTextDisplay";

interface NoteContentDisplayProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  showScannedImage?: boolean;
  scannedImageUrl?: string;
}

export const NoteContentDisplay = ({
  content,
  fontSize,
  textAlign,
  showScannedImage = false,
  scannedImageUrl
}: NoteContentDisplayProps) => {
  const [showOriginalScan, setShowOriginalScan] = useState<boolean>(false);

  const toggleOriginalScan = () => {
    setShowOriginalScan(!showOriginalScan);
  };

  return (
    <div className="space-y-4">
      {showScannedImage && scannedImageUrl && (
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOriginalScan}
            className="mb-2"
          >
            {showOriginalScan ? "Hide Original Scan" : "Show Original Scan"}
          </Button>
          
          {showOriginalScan && (
            <div className="mb-6">
              <div className="relative rounded-md overflow-hidden border border-mint-100">
                <img 
                  src={scannedImageUrl} 
                  alt="Original scanned image" 
                  className="w-full h-auto"
                />
                <a 
                  href={scannedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 bg-background/70 p-1 rounded-md"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Original scanned document</p>
            </div>
          )}
        </div>
      )}

      <RichTextDisplay 
        content={content}
        fontSize={fontSize}
        textAlign={textAlign}
      />
    </div>
  );
};
