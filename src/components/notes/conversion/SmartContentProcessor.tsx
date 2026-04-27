
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlashcardType } from "./FlashcardTypeSelector";
import { ProcessingControls } from "./ProcessingControls";
import { FlashcardPreview } from "./FlashcardPreview";
import { smartProcessContent } from "./utils/contentProcessingUtils";
import { generateFlashcardsFromNotes } from "@/services/aiService";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

interface SmartContentProcessorProps {
  noteContent: string;
  noteTitle: string;
  desiredCardCount: number;
  isCreating?: boolean;
  /** Whether `noteContent` is the AI-enriched version of the note. Used purely for UI labelling. */
  usingEnrichedContent?: boolean;
  /** Subject name for prompt context (helps the LLM tone). */
  subjectName?: string;
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
  isCreating = false,
  usingEnrichedContent = false,
  subjectName,
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
  const [usedFallback, setUsedFallback] = useState(false);

  const processContent = async () => {
    setIsProcessing(true);
    setUsedFallback(false);

    try {
      // Primary path: LLM-generated cards via the edge function.
      const aiCards = await generateFlashcardsFromNotes(
        noteContent,
        desiredCardCount,
        subjectName
      );

      if (aiCards && aiCards.length > 0) {
        setPreviewCards(
          aiCards.map(c => ({ front: c.front, back: c.back, type: selectedType }))
        );
        setShowPreview(true);
        return;
      }

      // Edge function returned 0 cards — fall through to template fallback.
      throw new Error('AI returned no cards');
    } catch (error) {
      console.warn('AI flashcard generation failed, falling back to local templates:', error);
      try {
        const processedCards = await smartProcessContent(
          noteContent,
          noteTitle,
          selectedType,
          desiredCardCount
        );
        setPreviewCards(processedCards);
        setShowPreview(true);
        setUsedFallback(true);
        toast("Used basic generator", {
          description: "AI generation was unavailable — created template-based cards. You can regenerate later for better quality.",
        });
      } catch (fallbackError) {
        console.error('Fallback content processing also failed:', fallbackError);
        toast.error('Could not generate flashcards from this note.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCards = async () => {
    if (isCreating) return;
    if (previewCards.length > 0) {
      await onCreateFlashcards(previewCards);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-mint-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 flex-wrap">
            <Wand2 className="h-5 w-5 text-mint-600" />
            Smart Content Processing
            <Badge variant="secondary" className="text-xs">
              {usedFallback ? 'Template fallback' : 'AI-Generated'}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${usingEnrichedContent ? 'border-emerald-400 text-emerald-700' : 'border-muted-foreground/40 text-muted-foreground'}`}
            >
              {usingEnrichedContent ? 'Source: Enriched note' : 'Source: Original note'}
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
          isCreating={isCreating}
        />
      )}
    </div>
  );
};
