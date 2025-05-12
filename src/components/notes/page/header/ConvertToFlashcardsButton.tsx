
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Book } from "lucide-react";

interface ConvertToFlashcardsButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const ConvertToFlashcardsButton = ({
  onClick,
  disabled
}: ConvertToFlashcardsButtonProps) => {
  return (
    <Button 
      variant="outline" 
      className="whitespace-nowrap border-mint-200 hover:bg-mint-50"
      onClick={onClick}
      disabled={disabled}
    >
      <FileText className="mr-1 h-4 w-4" />
      <ArrowRight className="mr-1 h-3 w-3" />
      <Book className="mr-2 h-4 w-4" />
      Convert to Flashcards
    </Button>
  );
};
