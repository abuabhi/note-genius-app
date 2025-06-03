
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, HelpCircle, Type, Edit3 } from "lucide-react";

export type FlashcardType = 'question-answer' | 'definition' | 'fill-blank' | 'concept';

interface FlashcardTypeSelectorProps {
  selectedType: FlashcardType;
  onTypeChange: (type: FlashcardType) => void;
}

const flashcardTypes = [
  {
    id: 'question-answer' as FlashcardType,
    name: 'Question & Answer',
    description: 'Traditional Q&A format',
    icon: HelpCircle,
    example: 'Q: What is...? → A: The answer is...'
  },
  {
    id: 'definition' as FlashcardType,
    name: 'Definition',
    description: 'Term and definition pairs',
    icon: FileText,
    example: 'Term → Definition'
  },
  {
    id: 'fill-blank' as FlashcardType,
    name: 'Fill in the Blank',
    description: 'Sentences with missing words',
    icon: Edit3,
    example: 'The _____ is important → answer'
  },
  {
    id: 'concept' as FlashcardType,
    name: 'Concept',
    description: 'Concept explanation format',
    icon: Type,
    example: 'Concept → Explanation'
  }
];

export const FlashcardTypeSelector = ({
  selectedType,
  onTypeChange
}: FlashcardTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-slate-800">Choose Flashcard Type</h3>
        <Badge variant="secondary" className="text-xs">
          Smart Processing
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {flashcardTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-mint-500 bg-mint-50 border-mint-200'
                  : 'hover:bg-slate-50 border-slate-200'
              }`}
              onClick={() => onTypeChange(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? 'bg-mint-500 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 mb-1">
                      {type.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {type.description}
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      {type.example}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
