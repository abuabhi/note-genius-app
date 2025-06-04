
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
      className="whitespace-nowrap border-mint-200 hover:bg-mint-50 text-mint-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center">
        <FileText className="mr-2 h-4 w-4 text-mint-600" />
        <ArrowRight className="mr-2 h-3 w-3 text-mint-500" />
        <Book className="mr-2 h-4 w-4 text-mint-600" />
        <span>Convert to Flashcards</span>
      </div>
    </Button>
  );
};
