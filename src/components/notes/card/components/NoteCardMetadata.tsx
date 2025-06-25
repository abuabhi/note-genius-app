
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Sparkles, Clock } from "lucide-react";
import { Note } from "@/types/note";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NoteCardMetadataProps {
  note: Note;
}

// Calculate estimated read time based on content length
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readTime); // Minimum 1 minute
};

export const NoteCardMetadata = ({ note }: NoteCardMetadataProps) => {
  const navigate = useNavigate();
  
  const handleGoToStudyMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("🎯 Study button clicked - Navigating to study mode for note:", note.id, note.title);
    navigate(`/notes/study/${note.id}`);
  };

  // Calculate read time from content
  const content = note.content || note.description || '';
  const readTime = calculateReadTime(content);

  // Use browser's default timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a date object and adjust for timezone
  const noteDate = new Date(note.date);
  
  // Format date as dd-MMM-yyyy (e.g., 15-May-2023) using user's timezone
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric',
    timeZone: userTimezone
  }).format(noteDate);

  return (
    <div className="flex justify-between items-center w-full">
      {/* Left side - metadata */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {/* Read time */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="font-medium">{readTime} min read</span>
        </div>
        
        {/* Date */}
        <span className="font-bold">
          {formattedDate}
        </span>

        {/* Tags count */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {note.tags.length}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Study Button */}
      <Button
        onClick={handleGoToStudyMode}
        className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-medium rounded-xl transition-all duration-200 relative z-10 shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-[1.02] px-3 py-1.5 h-auto text-xs"
        size="sm"
        type="button"
      >
        <Sparkles className="h-3 w-3 mr-1.5" />
        Study
      </Button>
    </div>
  );
};
