
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
      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-mint-600" />
        <ArrowRight className="h-3 w-3 text-mint-500" />
        <Book className="h-4 w-4 text-mint-600" />
        <span className="text-slate-700">Convert to Flashcards</span>
      </div>
    </DropdownMenuItem>
  );
};
