
import { Note } from "@/types/note";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, Book, Camera, FileText, Pin, Tag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteCardActions } from "./NoteCardActions";
import { NoteTagList } from "../details/NoteTagList";
import { generateColorFromString } from "@/utils/colorUtils";
import { getBestTextColor } from "@/utils/colorUtils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface NoteCardProps {
  note: Note;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  confirmDelete: string | null;
}

// Utility function to strip markdown formatting and return plain text
const stripMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove headers (# ## ###)
    .replace(/^#+\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove inline code (`text`)
    .replace(/`(.*?)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove list markers (- * +)
    .replace(/^[-*+]\s+/gm, '')
    // Remove numbered list markers (1. 2. etc)
    .replace(/^\d+\.\s+/gm, '')
    // Remove horizontal rules (--- or ***)
    .replace(/^(---|\*\*\*|___)\s*$/gm, '')
    // Remove code blocks (```text```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up multiple spaces and newlines
    .replace(/\s+/g, ' ')
    .trim();
};

export const NoteCard = ({
  note,
  onNoteClick,
  onShowDetails,
  onPin,
  onDelete,
  confirmDelete
}: NoteCardProps) => {
  const navigate = useNavigate();
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  // Find the subject name based on subject_id or fall back to category
  const getSubjectName = () => {
    if (note.subject_id && !subjectsLoading) {
      const foundSubject = subjects.find(s => s.id === note.subject_id);
      return foundSubject?.name || note.category || "Uncategorized";
    }
    return note.category || "Uncategorized";
  };

  const subjectName = getSubjectName();
  const subjectColor = generateColorFromString(subjectName);
  const textColor = getBestTextColor(subjectColor);
  
  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("🎯 Study button clicked - Navigating to study mode for note:", note.id, note.title);
    navigate(`/notes/study/${note.id}`);
  };

  // Format date as dd-MMM-yyyy (e.g., 15-May-2023)
  const formattedDate = format(new Date(note.date), "dd-MMM-yyyy");

  // Get plain text content without markdown formatting
  const plainTextContent = stripMarkdown(note.content || note.description || '');

  return (
    <Card 
      key={note.id}
      className={`
        group relative overflow-hidden transition-all duration-500 cursor-pointer
        bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl
        hover:scale-[1.02] hover:-translate-y-1
        ${note.pinned ? 'ring-2 ring-mint-400/50 shadow-mint-500/20' : ''}
        ${note.archived ? 'opacity-75' : ''}
        rounded-2xl
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-mint-500/5 before:via-transparent before:to-blue-500/5 before:opacity-0 before:transition-opacity before:duration-500
        hover:before:opacity-100
      `}
      onClick={() => onNoteClick(note)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-mint-50/20 pointer-events-none" />
      
      {/* Floating elements for modern design */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {note.sourceType === 'scan' && (
          <div className="w-8 h-8 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Camera className="h-4 w-4 text-blue-600" />
          </div>
        )}
        {note.pinned && (
          <div className="w-8 h-8 bg-mint-100/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Pin size={14} className="fill-mint-600 text-mint-600" />
          </div>
        )}
      </div>

      <CardHeader className="relative p-6 pb-4">
        {/* Card actions positioned absolutely - now always visible */}
        <div className="absolute top-4 right-16">
          <NoteCardActions 
            noteId={note.id}
            noteTitle={note.title}
            noteContent={note.content || note.description || ""}
            isPinned={!!note.pinned} 
            onPin={onPin}
            onDelete={onDelete}
            iconSize={5}
          />
        </div>
        
        <CardTitle className="text-xl text-slate-800 leading-relaxed pr-20 font-semibold">
          {note.title}
        </CardTitle>
        
        {/* Content preview with plain text only */}
        {plainTextContent && (
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mt-3">
            {plainTextContent}
          </p>
        )}
      </CardHeader>
      
      <CardFooter className="flex justify-between items-center px-6 py-4 pt-0">
        {/* Enhanced metadata section with subject color */}
        <div className="flex items-center gap-3">
          {/* Subject badge with generated color */}
          <Badge 
            className="px-3 py-1.5 text-xs font-medium border-0 shadow-sm"
            style={{ 
              backgroundColor: subjectColor, 
              color: textColor 
            }}
          >
            <Book className="h-3 w-3 mr-1.5" />
            {subjectName}
          </Badge>
          
          {/* Date */}
          <span className="text-xs text-slate-500 font-medium">
            {formattedDate}
          </span>
        </div>

        {/* Tags and actions */}
        <div className="flex items-center gap-3">
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {note.tags.length}
              </span>
            </div>
          )}
          
          {/* Enhanced Study Button - More Prominent */}
          <Button
            onClick={handleGoToStudyMode}
            className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-xl transition-all duration-200 relative z-10 shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-[1.02] px-4 py-2 h-auto"
            size="sm"
            type="button"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Study Mode
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
