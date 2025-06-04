
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlashcardType } from "./FlashcardTypeSelector";
import { ProcessingControls } from "./ProcessingControls";
import { FlashcardPreview } from "./FlashcardPreview";
import { smartProcessContent } from "./utils/contentProcessingUtils";
import { Wand2 } from "lucide-react";

interface SmartContentProcessorProps {
  noteContent: string;
  noteTitle: string;
  desiredCardCount: number;
  onCreateFlashcards: (flashcards: Array<{
    front: string;
    back: string;
    type: FlashcardType;
  }>) => Promise<void>;
}

export const SmartContentProcessor = ({
  noteContent,
  noteTitle,
  desiredCardCount,
  onCreateFlashcards
}: SmartContentProcessorProps) => {
  const [selectedType, setSelectedType] = useState<FlashcardType>('question-answer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewCards, setPreviewCards] = useState<Array<{
    front: string;
    back: string;
    type: FlashcardType;
  }>>([]);
  const [showPreview, setShowPreview] = useState(false);

  const processContent = async () => {
    setIsProcessing(true);
    
    try {
      const processedCards = await smartProcessContent(noteContent, noteTitle, selectedType, desiredCardCount);
      setPreviewCards(processedCards);
      setShowPreview(true);
    } catch (error) {
      console.error('Error processing content:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCards = async () => {
    if (previewCards.length > 0) {
      await onCreateFlashcards(previewCards);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-mint-600" />
            Smart Content Processing
            <Badge variant="secondary" className="text-xs">
              AI-Enhanced
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessingControls
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            isProcessing={isProcessing}
            onProcess={processContent}
            previewCount={previewCards.length}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
          />
        </CardContent>
      </Card>

      {showPreview && (
        <FlashcardPreview
          cards={previewCards}
          onCreateCards={handleCreateCards}
        />
      )}
    </div>
  );
};
