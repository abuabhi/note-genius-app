
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FileText, ArrowRight, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConvertToFlashcardsActionProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
}

export const ConvertToFlashcardsAction = ({
  noteId,
  noteTitle,
  noteContent
}: ConvertToFlashcardsActionProps) => {
  const navigate = useNavigate();

  const handleConvert = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Navigate to conversion page with note data
    navigate(`/note-to-flashcard?noteId=${noteId}`, {
      state: { 
        selectedNotes: [{ id: noteId, title: noteTitle, content: noteContent }],
        fromNoteCard: true 
      }
    });
  };

  return (
    <DropdownMenuItem 
      onClick={handleConvert}
      className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-mint-50 transition-colors duration-200 group"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors duration-200">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-purple-600" />
          <ArrowRight className="h-2 w-2 text-purple-500" />
          <Book className="h-3 w-3 text-purple-600" />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-900">Convert to Flashcards</span>
    </DropdownMenuItem>
  );
};
