
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FlashcardType, FlashcardTypeSelector } from "./FlashcardTypeSelector";
import { Sparkles, Eye, EyeOff, Wand2 } from "lucide-react";

interface SmartContentProcessorProps {
  noteContent: string;
  noteTitle: string;
  onCreateFlashcards: (flashcards: Array<{
    front: string;
    back: string;
    type: FlashcardType;
  }>) => Promise<void>;
}

export const SmartContentProcessor = ({
  noteContent,
  noteTitle,
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
      // Smart content processing based on type
      const processedCards = await smartProcessContent(noteContent, noteTitle, selectedType);
      setPreviewCards(processedCards);
      setShowPreview(true);
    } catch (error) {
      console.error('Error processing content:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const smartProcessContent = async (
    content: string, 
    title: string, 
    type: FlashcardType
  ): Promise<Array<{ front: string; back: string; type: FlashcardType }>> => {
    // This would be enhanced with AI processing in the future
    // For now, we'll implement basic content splitting
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const cards = [];

    switch (type) {
      case 'question-answer':
        for (let i = 0; i < Math.min(sentences.length, 5); i++) {
          const sentence = sentences[i].trim();
          cards.push({
            front: `What does the note "${title}" say about: ${sentence.substring(0, 50)}...?`,
            back: sentence,
            type
          });
        }
        break;
        
      case 'definition':
        // Extract key terms (simple implementation)
        const keywords = extractKeywords(content);
        for (const keyword of keywords.slice(0, 5)) {
          const context = findContextForKeyword(content, keyword);
          cards.push({
            front: keyword,
            back: context || `Definition from: ${title}`,
            type
          });
        }
        break;
        
      case 'fill-blank':
        for (let i = 0; i < Math.min(sentences.length, 3); i++) {
          const sentence = sentences[i].trim();
          const words = sentence.split(' ');
          if (words.length > 5) {
            const blankIndex = Math.floor(words.length / 2);
            const blankedSentence = words.map((word, index) => 
              index === blankIndex ? '______' : word
            ).join(' ');
            
            cards.push({
              front: blankedSentence,
              back: words[blankIndex],
              type
            });
          }
        }
        break;
        
      case 'concept':
        cards.push({
          front: `Main concept from: ${title}`,
          back: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          type
        });
        break;
    }

    return cards;
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\W+/);
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    return words
      .filter(word => word.length > 4 && !commonWords.has(word))
      .slice(0, 10);
  };

  const findContextForKeyword = (text: string, keyword: string): string => {
    const sentences = text.split(/[.!?]+/);
    const relevantSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    );
    return relevantSentence?.trim() || '';
  };

  const handleCreateCards = async () => {
    if (previewCards.length > 0) {
      await onCreateFlashcards(previewCards);
      setShowPreview(false);
      setPreviewCards([]);
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
        <CardContent className="space-y-6">
          <FlashcardTypeSelector
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
          
          <div className="flex items-center gap-3">
            <Button
              onClick={processContent}
              disabled={isProcessing}
              className="bg-gradient-to-r from-mint-600 to-blue-600 hover:from-mint-700 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <Sparkles className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Generate Flashcards'}
            </Button>
            
            {previewCards.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="border-mint-200"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} Preview ({previewCards.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      {showPreview && previewCards.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Flashcard Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {previewCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg border border-blue-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2 text-xs">Front</Badge>
                      <p className="text-sm text-slate-700">{card.front}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2 text-xs">Back</Badge>
                      <p className="text-sm text-slate-700">{card.back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-blue-200">
              <Button
                onClick={handleCreateCards}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create {previewCards.length} Flashcards
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
