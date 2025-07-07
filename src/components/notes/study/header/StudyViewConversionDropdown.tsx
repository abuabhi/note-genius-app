import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, FileText, ArrowRight, Book, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Note } from "@/types/note";

interface StudyViewConversionDropdownProps {
  note: Note;
}

export const StudyViewConversionDropdown = ({
  note
}: StudyViewConversionDropdownProps) => {
  const navigate = useNavigate();

  const handleConvertToFlashcards = () => {
    navigate(`/note-to-flashcard?noteId=${note.id}`, {
      state: { 
        selectedNotes: [{ 
          id: note.id, 
          title: note.title, 
          content: note.content || note.description || ""
        }],
        fromNoteCard: true 
      }
    });
  };

  const handleConvertToQuiz = () => {
    navigate(`/create-quiz`, {
      state: { 
        selectedNotes: [{ 
          id: note.id, 
          title: note.title, 
          content: note.content || note.description || ""
        }],
        fromNoteCard: true,
        activeTab: "notes"
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
          <RefreshCw className="mr-2 h-4 w-4 text-blue-600" />
          Convert
          <ChevronDown className="ml-2 h-4 w-4 text-blue-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-white border border-gray-200 shadow-lg rounded-md z-50"
      >
        <DropdownMenuItem 
          onClick={handleConvertToFlashcards}
          className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors duration-200">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-purple-600" />
              <ArrowRight className="h-2 w-2 text-purple-500" />
              <Book className="h-3 w-3 text-purple-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Convert to Flashcards</span>
            <span className="text-xs text-gray-500">Create study cards from this note</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
        
        <DropdownMenuItem 
          onClick={handleConvertToQuiz}
          className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-200">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-600" />
              <ArrowRight className="h-2 w-2 text-blue-500" />
              <HelpCircle className="h-3 w-3 text-blue-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Convert to Quiz</span>
            <span className="text-xs text-gray-500">Generate quiz questions from this note</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};