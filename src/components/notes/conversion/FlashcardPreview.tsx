
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlashcardType } from "./FlashcardTypeSelector";

interface FlashcardPreviewProps {
  cards: Array<{
    front: string;
    back: string;
    type: FlashcardType;
  }>;
  onCreateCards: () => void;
}

export const FlashcardPreview = ({ cards, onCreateCards }: FlashcardPreviewProps) => {
  if (cards.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-lg">Flashcard Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {cards.map((card, index) => (
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
            onClick={onCreateCards}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create {cards.length} Flashcards
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
