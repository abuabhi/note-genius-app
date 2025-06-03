
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// Helper function to strip HTML tags and decode HTML entities
const stripHtmlAndDecode = (html: string): string => {
  // Create a temporary div element to decode HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content (this strips HTML tags and decodes entities)
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

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
    // Enhanced content processing
    if (!content || content.trim().length === 0) {
      return [{
        front: `What is the main topic of: ${stripHtmlAndDecode(title)}?`,
        back: "This note appears to be empty or has no content to process.",
        type
      }];
    }
    
    // Strip HTML from content first
    const cleanContent = stripHtmlAndDecode(content);
    const cleanTitle = stripHtmlAndDecode(title);
    
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const cards = [];

    switch (type) {
      case 'question-answer':
        const maxQA = Math.min(sentences.length, 5);
        for (let i = 0; i < maxQA; i++) {
          const sentence = sentences[i].trim();
          if (sentence.length > 10) {
            cards.push({
              front: `According to "${cleanTitle}", what can you tell me about: ${sentence.substring(0, 50)}...?`,
              back: sentence,
              type
            });
          }
        }
        break;
        
      case 'definition':
        const keywords = extractKeywords(cleanContent);
        for (const keyword of keywords.slice(0, 4)) {
          const context = findContextForKeyword(cleanContent, keyword);
          cards.push({
            front: `Define: ${keyword}`,
            back: context || `A concept from: ${cleanTitle}`,
            type
          });
        }
        break;
        
      case 'fill-blank':
        const maxFill = Math.min(sentences.length, 3);
        for (let i = 0; i < maxFill; i++) {
          const sentence = sentences[i].trim();
          const words = sentence.split(' ');
          if (words.length > 5) {
            const blankIndex = Math.floor(words.length / 2);
            const blankedSentence = words.map((word, index) => 
              index === blankIndex ? '______' : word
            ).join(' ');
            
            cards.push({
              front: `Fill in the blank: ${blankedSentence}`,
              back: words[blankIndex],
              type
            });
          }
        }
        break;
        
      case 'concept':
        const conceptText = cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
        cards.push({
          front: `Explain the main concept from: ${cleanTitle}`,
          back: conceptText,
          type
        });
        
        // Add a secondary concept card if there's more content
        if (sentences.length > 1) {
          cards.push({
            front: `What are the key details mentioned in: ${cleanTitle}?`,
            back: sentences.slice(0, 3).join('. '),
            type
          });
        }
        break;
    }

    // Ensure we always return at least one card
    if (cards.length === 0) {
      cards.push({
        front: `What is the main topic of: ${cleanTitle}?`,
        back: cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : ''),
        type
      });
    }

    return cards;
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().split(/\W+/);
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 8);
  };

  const findContextForKeyword = (text: string, keyword: string): string => {
    const sentences = text.split(/[.!?]+/);
    const relevantSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    );
    return relevantSentence?.trim() || `Related to ${keyword}`;
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
